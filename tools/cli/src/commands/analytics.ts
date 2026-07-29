import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getGitDiff } from '../utils/git.js';
import { loadPrompt } from '../utils/prompt-loader.js';
import { runAiReview } from '../utils/ai-runner.js';
import { writeReport } from '../utils/report-writer.js';

export const analyticsCommand = new Command('analytics')
  .description('Review analytics event naming and instrumentation consistency')
  .option('-b, --base <branch>', 'Base branch to diff against', 'main')
  .option('-o, --output <file>', 'Output report file', 'analytics-report.md')
  .action(async (options) => {
    console.log(chalk.bold.blue('\n📊 DevX Analytics Review\n'));
    const spinner = ora('Reviewing analytics instrumentation...').start();
    try {
      const diff = await getGitDiff({ base: options.base, staged: false });
      if (!diff.trim()) { spinner.warn('No changes detected.'); return; }

      const prompt = await loadPrompt('analytics');
      const rules = [
        'Events use snake_case naming',
        'All events include userId and sessionId',
        'Event names are descriptive and consistent',
        'No PII in event properties',
        'Track page views on route changes',
        'Business events must have a corresponding spec',
      ];

      const review = await runAiReview({ diff, prompt, rules });
      const reportPath = await writeReport(review, options.output, 'Analytics Review');
      spinner.succeed(chalk.green(`Analytics report: ${reportPath}`));
    } catch (err) {
      spinner.fail('Analytics review failed');
      console.error(chalk.red(String(err)));
      process.exit(1);
    }
  });
