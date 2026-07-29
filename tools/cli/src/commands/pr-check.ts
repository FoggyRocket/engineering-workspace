import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getGitDiff } from '../utils/git.js';
import { detectProjectType } from '../utils/project-detector.js';
import { loadPrompt } from '../utils/prompt-loader.js';
import { loadRules } from '../utils/rules-loader.js';
import { hasBlockingFindings, runAiReview } from '../utils/ai-runner.js';
import { writeReport } from '../utils/report-writer.js';

export const prCheckCommand = new Command('pr-check')
  .description('Full pre-PR checklist: review + security + analytics in one pass')
  .option('-b, --base <branch>', 'Base branch to diff against', 'main')
  .option('-o, --output <dir>', 'Output directory for reports', '.')
  .action(async (options) => {
    console.log(chalk.bold.magenta('\n🚀 DevX PR Check — Full Review\n'));
    const spinner = ora('Running comprehensive PR checks...').start();

    try {
      const diff = await getGitDiff({ base: options.base, staged: false });
      if (!diff.trim()) { spinner.warn('No changes detected.'); return; }

      const projectType = await detectProjectType();
      const prompt = await loadPrompt('pr-check', projectType);
      const rules = await loadRules(projectType);

      spinner.text = 'Running AI analysis across all dimensions...';
      const review = await runAiReview({ diff, prompt, rules, comprehensive: true });

      const reportPath = await writeReport(review, `${options.output}/pr-check-report.md`, 'PR Check');
      spinner.succeed(chalk.bold.green(`\n✅ PR Check complete → ${reportPath}`));

      if (hasBlockingFindings(review)) {
        console.log(chalk.bold.red('\n⚠️  Must Fix findings detected. Please address before merging.\n'));
        process.exit(1);
      }
    } catch (err) {
      spinner.fail('PR check failed');
      console.error(chalk.red(String(err)));
      process.exit(1);
    }
  });
