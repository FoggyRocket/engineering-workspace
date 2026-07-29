import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getGitDiff } from '../utils/git.js';
import { detectProjectType } from '../utils/project-detector.js';
import { loadPrompt } from '../utils/prompt-loader.js';
import { loadRules } from '../utils/rules-loader.js';
import { runAiReview } from '../utils/ai-runner.js';
import { writeReport } from '../utils/report-writer.js';
import { printReport } from '../utils/report-printer.js';
 
export const reviewCommand = new Command('review')
  .description('Run an AI-powered code review on git changes')
  .option('-b, --base <branch>', 'Base branch to diff against', 'main')
  .option('-o, --output <file>', 'Output report file', 'review-report.md')
  .option('--staged', 'Review only staged changes', false)
  .option('--dry-run', 'Print prompt without calling AI', false)
  .option('--no-print', 'Skip terminal output, only write file', false)
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n🔍 DevX AI Review\n'));
 
    const spinner = ora('Detecting changes...').start();
 
    try {
      const diff = await getGitDiff({ base: options.base, staged: options.staged });
      if (!diff.trim()) {
        spinner.warn('No changes detected. Ensure you have committed or staged changes.');
        return;
      }
      spinner.succeed(`Loaded diff (${diff.split('\n').length} lines)`);
 
      spinner.start('Detecting project type...');
      const projectType = await detectProjectType();
      spinner.succeed(`Detected project: ${chalk.yellow(projectType)}`);
 
      spinner.start('Loading AI review prompt...');
      const prompt = await loadPrompt('ai-review', projectType);
      spinner.succeed('Prompt loaded');
 
      spinner.start('Loading engineering standards...');
      const rules = await loadRules(projectType);
      spinner.succeed(
        `Rules loaded (${rules.hard.length} hard, ${rules.soft.length} soft)`,
      );
 
      if (options.dryRun) {
        console.log(chalk.dim('\n--- DRY RUN: Prompt Preview ---\n'));
        console.log(prompt.substring(0, 500) + '...');
        return;
      }
 
      spinner.start('Running AI review...');
      const review = await runAiReview({ diff, prompt, rules });
      spinner.succeed('Review complete');
 
      // Print colorized report in terminal
      if (options.print !== false) {
        printReport(review);
      }
 
      // Also write to file
      const reportPath = await writeReport(review, options.output);
      console.log(chalk.dim(`\nReport saved to: ${reportPath}\n`));
 
    } catch (err) {
      spinner.fail('Review failed');
      console.error(chalk.red(String(err)));
      process.exit(1);
    }
  });
