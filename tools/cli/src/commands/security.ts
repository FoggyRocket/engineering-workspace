import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getGitDiff } from '../utils/git.js';
import { loadPrompt } from '../utils/prompt-loader.js';
import { runAiReview } from '../utils/ai-runner.js';
import { writeReport } from '../utils/report-writer.js';

export const securityCommand = new Command('security')
  .description('Run a security-focused AI review on git changes')
  .option('-b, --base <branch>', 'Base branch to diff against', 'main')
  .option('-o, --output <file>', 'Output report file', 'security-report.md')
  .action(async (options) => {
    console.log(chalk.bold.red('\n🔐 DevX Security Review\n'));
    const spinner = ora('Running security analysis...').start();
    try {
      const diff = await getGitDiff({ base: options.base, staged: false });
      if (!diff.trim()) { spinner.warn('No changes detected.'); return; }

      const prompt = await loadPrompt('security');
      const rules = ['No hardcoded secrets', 'Validate all user inputs', 'Sanitize SQL queries',
        'Use parameterized queries', 'Enforce auth on all routes', 'No sensitive data in logs'];

      const review = await runAiReview({ diff, prompt, rules });
      const reportPath = await writeReport(review, options.output, 'Security Review');
      spinner.succeed(chalk.green(`Security report: ${reportPath}`));
    } catch (err) {
      spinner.fail('Security review failed');
      console.error(chalk.red(String(err)));
      process.exit(1);
    }
  });
