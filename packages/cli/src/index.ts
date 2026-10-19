#!/usr/bin/env node

import { Command } from 'commander';
import {
  CORE_VERSION,
  GitHubClient,
  normalizeRepoTarget,
  scoreSnapshot,
  RepoNotFoundError,
  PrivateRepoError,
  RateLimitError,
  UpstreamError,
  type AnalysisReport,
  type Grade,
} from '@repometric/core';
import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function loadEnvTokens(): void {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'apps/web/.env.local'),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=');
            const key = k.trim();
            const val = v.join('=').trim().replace(/^["']|["']$/g, '');
            if (!process.env[key] && val) {
              process.env[key] = val;
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }
}

export function formatGrade(grade: Grade): string {
  switch (grade) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'needs-work':
      return 'Needs work';
    case 'at-risk':
      return 'At risk';
    default:
      return grade;
  }
}

export function formatReport(
  report: AnalysisReport,
  options: { noColor?: boolean } = {}
): string {
  const useColor = !options.noColor && !process.env.NO_COLOR;

  // Grade color
  let gradeColor = '';
  let resetColor = '';
  let bold = '';
  let dim = '';

  if (useColor) {
    resetColor = '\x1b[0m';
    bold = '\x1b[1m';
    dim = '\x1b[2m';
    switch (report.grade) {
      case 'excellent':
        gradeColor = '\x1b[32m'; // green
        break;
      case 'good':
        gradeColor = '\x1b[36m'; // cyan
        break;
      case 'needs-work':
        gradeColor = '\x1b[33m'; // yellow
        break;
      case 'at-risk':
        gradeColor = '\x1b[31m'; // red
        break;
    }
  }

  const lines: string[] = [];

  // Summary line: owner/repo  68/100  Needs work   (projected 86 after fixes)
  const gradeLabel = formatGrade(report.grade);
  const projectedStr =
    report.projectedScore > report.score
      ? `  ${dim}(projected ${report.projectedScore} after fixes)${resetColor}`
      : '';

  lines.push(
    `${bold}${report.repo.owner}/${report.repo.name}${resetColor}  ${bold}${report.score}/100${resetColor}  ${gradeColor}${gradeLabel}${resetColor}${projectedStr}`
  );
  lines.push('');

  // Categories list
  for (const cat of report.categories) {
    const earnedStr = cat.excluded ? 'n/a' : `${Math.round(cat.earned)}/${cat.weight}`;
    lines.push(`${cat.label.padEnd(16)} ${earnedStr}`);
  }

  // Top fixes
  if (report.fixes && report.fixes.length > 0) {
    lines.push('');
    lines.push(`${bold}Top fixes${resetColor}`);
    for (const fix of report.fixes.slice(0, 5)) {
      const gain = `+${fix.pointsGain.toFixed(1)}`.padEnd(5);
      const title = fix.title.padEnd(33);
      lines.push(`  ${gain} ${title} (${fix.effort})`);
    }
  }

  return lines.join('\n');
}

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
    .action(async (target, options) => {
      if (!target) {
        program.help();
        process.exit(2);
        return;
      }

      // Check for local path mode
      if (target === '.' || target.startsWith('./') || target.startsWith('../')) {
        console.error(
          `Local path mode for "${target}" is not yet available in this release. Please specify a GitHub repository (e.g. expressjs/express or https://github.com/expressjs/express).`
        );
        process.exit(2);
        return;
      }

      let repoTarget;
      try {
        repoTarget = normalizeRepoTarget(target);
      } catch {
        console.error(
          `Error: Invalid target "${target}". Expected owner/repo or https://github.com/owner/repo`
        );
        process.exit(2);
        return;
      }

      loadEnvTokens();
      const token = options.token || process.env.GITHUB_TOKEN;
      const client = new GitHubClient({ token });

      try {
        if (!options.json) {
          console.log(`Analyzing ${repoTarget.owner}/${repoTarget.name}...`);
        }

        const snapshot = await client.getSnapshot(repoTarget.owner, repoTarget.name);
        const report = scoreSnapshot(snapshot);

        if (options.json) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          console.log('\n' + formatReport(report, options));
        }

        // Handle --open flag
        if (options.open) {
          const webUrl = `http://localhost:3000/r/${repoTarget.owner}/${repoTarget.name}`;
          const startCmd =
            process.platform === 'win32'
              ? `start "" "${webUrl}"`
              : process.platform === 'darwin'
                ? `open "${webUrl}"`
                : `xdg-open "${webUrl}"`;
          exec(startCmd, () => {});
        }

        // Handle --min-score
        if (options.minScore !== undefined) {
          const min = Number(options.minScore);
          if (report.score < min) {
            process.exitCode = 1;
            return;
          }
        }

        process.exitCode = 0;
      } catch (err) {
        if (err instanceof RepoNotFoundError) {
          console.error(`Error: Repository "${repoTarget.owner}/${repoTarget.name}" not found.`);
          process.exitCode = 3;
        } else if (err instanceof PrivateRepoError) {
          console.error(
            `Error: "${repoTarget.owner}/${repoTarget.name}" is private. RepoMetric v1 supports public repositories only.`
          );
          process.exitCode = 3;
        } else if (err instanceof RateLimitError) {
          console.error(
            `Error: GitHub rate limit reached. Resets at ${err.resetAt.toISOString()}. Pass --token or set GITHUB_TOKEN.`
          );
          process.exitCode = 4;
        } else if (err instanceof UpstreamError) {
          console.error(`Error: Upstream GitHub API error: ${err.message}`);
          process.exitCode = 4;
        } else {
          console.error(`Error: ${(err as Error).message || err}`);
          process.exitCode = 4;
        }
      }
    });

  return program;
}

// Only parse when executed directly
if (
  process.argv[1]?.endsWith('repometric') ||
  process.argv[1]?.endsWith('repo-analyzer') ||
  process.argv[1]?.endsWith('index.js') ||
  process.argv[1]?.endsWith('index.ts')
) {
  createProgram().parse(process.argv);
}
