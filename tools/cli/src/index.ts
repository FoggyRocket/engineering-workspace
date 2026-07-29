#!/usr/bin/env node
import { Command } from 'commander';
import { reviewCommand } from './commands/review.js';
import { securityCommand } from './commands/security.js';
import { analyticsCommand } from './commands/analytics.js';
import { prCheckCommand } from './commands/pr-check.js';

const program = new Command();

program
  .name('devx')
  .description('Engineering Workspace CLI — shared standards, AI review, and automation')
  .version('1.0.0');

program.addCommand(reviewCommand);
program.addCommand(securityCommand);
program.addCommand(analyticsCommand);
program.addCommand(prCheckCommand);

program.parse();
