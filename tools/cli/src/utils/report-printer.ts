import chalk from 'chalk';

export function printReport(report: string): void {
  const lines = report.split('\n');

  for (const line of lines) {
    if (line.startsWith('# ')) {
      console.log('\n' + chalk.bold.white(line.replace('# ', '')));
    } else if (line.startsWith('## Must Fix') || line.startsWith('## Critical Issues')) {
      console.log('\n' + chalk.bold.red('🔴 Must Fix'));
      console.log(chalk.red('─'.repeat(40)));
    } else if (line.startsWith('## Standards') || line.startsWith('## Warnings')) {
      console.log('\n' + chalk.bold.yellow('🟡 Standards'));
      console.log(chalk.yellow('─'.repeat(40)));
    } else if (line.startsWith('## Suggestions')) {
      console.log('\n' + chalk.bold.blue('🔵 Suggestions'));
      console.log(chalk.blue('─'.repeat(40)));
    } else if (line.startsWith('## Positive Notes')) {
      console.log('\n' + chalk.bold.green('🟢 Positive Notes'));
      console.log(chalk.green('─'.repeat(40)));
    } else if (line.startsWith('## Security Assessment')) {
      console.log('\n' + chalk.bold.magenta('🔐 Security Assessment'));
      console.log(chalk.magenta('─'.repeat(40)));
    } else if (line.startsWith('## Test Coverage')) {
      console.log('\n' + chalk.bold.cyan('🧪 Test Coverage'));
      console.log(chalk.cyan('─'.repeat(40)));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.replace(/^[-*] /, '');
      const section = getCurrentSection(lines, lines.indexOf(line));

      if (section === 'critical') {
        console.log(chalk.red('  ✖ ' + text));
      } else if (section === 'warnings') {
        console.log(chalk.yellow('  ⚠ ' + text));
      } else if (section === 'suggestions') {
        console.log(chalk.blue('  → ' + text));
      } else if (section === 'positive') {
        console.log(chalk.green('  ✔ ' + text));
      } else {
        console.log(chalk.white('  • ' + text));
      }
    } else if (line.trim() === '') {
      // skip extra blank lines
    } else if (line.includes('None found')) {
      console.log(chalk.dim('  None found.'));
    } else {
      console.log(chalk.dim('  ' + line));
    }
  }

  console.log('\n' + chalk.dim('─'.repeat(40)));
}

function getCurrentSection(lines: string[], currentIndex: number): string {
  for (let i = currentIndex; i >= 0; i--) {
    const line = lines[i] ?? '';
    if (line.startsWith('## Must Fix') || line.startsWith('## Critical')) return 'critical';
    if (line.startsWith('## Standards') || line.startsWith('## Warn')) return 'warnings';
    if (line.startsWith('## Suggest')) return 'suggestions';
    if (line.startsWith('## Positive')) return 'positive';
  }
  return 'other';
}
