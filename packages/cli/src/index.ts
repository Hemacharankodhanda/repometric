#!/usr/bin/env node

import { Command } from 'commander';
import { CORE_VERSION } from '@repo-analyzer/core';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('repometric')
    .description('Analyze GitHub repositories for health, structure, and dependencies')
    .version(CORE_VERSION)
    .argument('[target]', 'owner/repo, a GitHub URL, or a local path such as .')
    .option('--json', 'print AnalysisReport as JSON')
    .option('--min-score <n>', 'exit 1 if score is below n')
    .option('--token <t>', 'GitHub token (or env GITHUB_TOKEN)')
    .option('--open', 'open the web report in the browser')
    .option('--no-color', 'disable colored output')
    .action((target, options) => {
      if (!target) {
        program.help();
        return;
      }
      console.log(`Analyzing ${target}... (Repometric core v${CORE_VERSION})`);
      if (options.json) {
        console.log(JSON.stringify({ target, status: 'scaffold' }));
      }
    });

  return program;
}

// Only parse when executed directly
if (
  process.argv[1]?.endsWith('repometric') ||
  process.argv[1]?.endsWith('repo-analyzer') ||
  process.argv[1]?.endsWith('index.js')
) {
  createProgram().parse(process.argv);
}
