import type { Effort, Fix } from '../types';
import type { EvaluatedCategory } from './engine';

export interface FixTemplate {
  signalId: string;
  title: string;
  effort: Effort;
  why: string;
  how: string;
}

export const EFFORT_WEIGHTS: Record<Effort, number> = {
  S: 1,
  M: 3,
  L: 8,
};

export const FIX_TEMPLATES: Record<string, FixTemplate> = {
  'activity.commits_90d': {
    signalId: 'activity.commits_90d',
    title: 'Commit regularly',
    effort: 'L',
    why: 'A steady stream of commits demonstrates active maintenance and ongoing investment.',
    how: 'Break upcoming work into smaller iterative commits and push progress regularly.',
  },
  'activity.last_commit': {
    signalId: 'activity.last_commit',
    title: 'Push a recent update',
    effort: 'S',
    why: 'Recent commits reassure prospective users that the repository has not been abandoned.',
    how: 'Commit and push your latest improvements or bug fixes to the default branch.',
  },
  'activity.releases': {
    signalId: 'activity.releases',
    title: 'Publish a release',
    effort: 'S',
    why: 'Releases give users stable milestones and clear changelogs.',
    how: 'Create a GitHub Release or git tag for your current stable commit.',
  },
  'maintenance.first_response': {
    signalId: 'maintenance.first_response',
    title: 'Reply to issues and PRs within a week',
    effort: 'M',
    why: 'Fast responses encourage community contributions and keep discussions moving forward.',
    how: 'Triage pending issues and respond with an acknowledgment or next steps within 7 days.',
  },
  'maintenance.stale_issues': {
    signalId: 'maintenance.stale_issues',
    title: 'Triage stale issues',
    effort: 'M',
    why: 'Unanswered issues signal an abandoned project to prospective users.',
    how: 'Review issues older than 90 days. Close resolved ones or tag active discussions.',
  },
  'maintenance.pr_merge_rate': {
    signalId: 'maintenance.pr_merge_rate',
    title: 'Review and close open pull requests',
    effort: 'M',
    why: 'Promptly merging or closing PRs prevents merge conflicts and unblocks contributors.',
    how: 'Review pending PRs, merge completed contributions, and close obsolete branches.',
  },
  'community.bus_factor': {
    signalId: 'community.bus_factor',
    title: 'Bring in a second contributor',
    effort: 'L',
    why: 'Distributing commits across multiple maintainers prevents a single point of failure.',
    how: 'Invite a trusted collaborator to co-maintain the repo and review pull requests.',
  },
  'community.contributors': {
    signalId: 'community.contributors',
    title: 'Invite contributors',
    effort: 'L',
    why: 'A diverse group of active contributors creates a resilient, long-term project.',
    how: 'Label beginner-friendly issues with good first issue and welcome external pull requests.',
  },
  'community.files': {
    signalId: 'community.files',
    title: 'Add CONTRIBUTING and issue templates',
    effort: 'S',
    why: 'Clear contribution guides and issue templates streamline incoming bug reports and PRs.',
    how: 'Add a CONTRIBUTING.md file and create templates in .github/ISSUE_TEMPLATE/.',
  },
  'docs.readme_exists': {
    signalId: 'docs.readme_exists',
    title: 'Add a README',
    effort: 'S',
    why: 'The README is the primary entry point for anyone evaluating your repository.',
    how: 'Create a README.md file at the repository root describing what the project does.',
  },
  'docs.readme_sections': {
    signalId: 'docs.readme_sections',
    title: 'Complete the missing README sections',
    effort: 'M',
    why: 'Visitors decide whether to use or contribute to your project in the first 30 seconds.',
    how: 'Add missing installation instructions, code usage examples, visuals, or license details.',
  },
  'docs.metadata': {
    signalId: 'docs.metadata',
    title: 'Add a description and topics',
    effort: 'S',
    why: 'Repository descriptions and GitHub topics increase discoverability and context.',
    how: 'Update the repository About section on GitHub with a concise summary and 3+ topics.',
  },
  'docs.folder': {
    signalId: 'docs.folder',
    title: 'Add a docs folder or homepage link',
    effort: 'M',
    why: 'In-depth documentation or a dedicated homepage helps users learn beyond the README.',
    how: 'Add a docs/ folder with architecture guides or configure a project homepage URL.',
  },
  'docs.comments': {
    signalId: 'docs.comments',
    title: 'Comment the non-obvious code',
    effort: 'M',
    why: 'Clear inline comments explain the rationale behind non-trivial design decisions.',
    how: 'Add explanatory comments to complex algorithms, regexes, and edge-case handling.',
  },
  'hygiene.tests': {
    signalId: 'hygiene.tests',
    title: 'Add tests',
    effort: 'L',
    why: 'A solid test suite prevents regressions and gives contributors confidence.',
    how: 'Add automated tests under a test/ or __tests__/ directory using your ecosystem test runner.',
  },
  'hygiene.ci': {
    signalId: 'hygiene.ci',
    title: 'Add a CI workflow',
    effort: 'S',
    why: 'Automated tests and checks on every pull request catch bugs before they reach main.',
    how: 'Add a GitHub Actions workflow file in .github/workflows/ci.yml running your test and build commands.',
  },
  'hygiene.lint_format': {
    signalId: 'hygiene.lint_format',
    title: 'Add a linter or formatter config',
    effort: 'S',
    why: 'Automated linters and formatters enforce consistent code style and prevent common bugs.',
    how: 'Add an ESLint, Prettier, Biome, or EditorConfig configuration file to your repository.',
  },
  'hygiene.gitignore': {
    signalId: 'hygiene.gitignore',
    title: 'Add a .gitignore',
    effort: 'S',
    why: 'A .gitignore file prevents accidental commits of build artifacts and environment files.',
    how: 'Add a .gitignore file at the repository root tailored to your project ecosystem.',
  },
  'hygiene.license': {
    signalId: 'hygiene.license',
    title: 'Add a LICENSE file',
    effort: 'S',
    why: 'An explicit open-source license informs users and enterprises how they may use your code.',
    how: 'Add a LICENSE file at the repository root (e.g. MIT, Apache-2.0, or BSD).',
  },
  'hygiene.secrets': {
    signalId: 'hygiene.secrets',
    title: 'Remove committed secrets and rotate them',
    effort: 'M',
    why: 'Committed secrets and environment files risk credential leaks and unauthorized access.',
    how: 'Remove the sensitive files from git history, rotate any exposed tokens, and use .env.example instead.',
  },
  'deps.lockfile': {
    signalId: 'deps.lockfile',
    title: 'Commit a lockfile',
    effort: 'S',
    why: 'Lockfiles guarantee deterministic dependency installations across different environments.',
    how: 'Generate and commit a package-lock.json, pnpm-lock.yaml, yarn.lock, or poetry.lock file.',
  },
  'deps.outdated': {
    signalId: 'deps.outdated',
    title: 'Update outdated dependencies',
    effort: 'M',
    why: 'Outdated dependencies accumulate security vulnerabilities and prevent ecosystem upgrades.',
    how: 'Run your package manager upgrade command to bump packages with major updates.',
  },
  'deps.deprecated': {
    signalId: 'deps.deprecated',
    title: 'Replace deprecated packages',
    effort: 'M',
    why: 'Deprecated packages receive no security updates and will eventually break with modern runtimes.',
    how: 'Identify the deprecated packages from registry warnings and migrate to supported alternatives.',
  },
};

/**
 * Generates fixes for all applicable signals with earned < max.
 * Formula per SCORING_SPEC.md section 3:
 * pointsGain = (max - earned) * (categoryWeight / categoryApplicableMax) * (100 / sumOfIncludedWeights)
 * effortWeight: S = 1, M = 3, L = 8
 * priority = pointsGain / effortWeight
 * Sort by priority descending, ties by pointsGain descending.
 */
export function generateFixes(
  evaluatedCategories: EvaluatedCategory[],
  sumOfIncludedWeights: number,
): Fix[] {
  const fixes: Fix[] = [];

  for (const cat of evaluatedCategories) {
    if (cat.applicableMax === 0 || sumOfIncludedWeights === 0) {
      continue;
    }

    for (const signal of cat.signals) {
      if (signal.status === 'na') {
        continue;
      }

      if (signal.earned < signal.max) {
        const rawGain =
          (signal.max - signal.earned) *
          (cat.weight / cat.applicableMax) *
          (100 / sumOfIncludedWeights);
        const pointsGain = Number(rawGain.toFixed(1));

        const template = FIX_TEMPLATES[signal.id] ?? {
          signalId: signal.id,
          title: `Improve ${signal.label}`,
          effort: 'M' as Effort,
          why: 'Resolving this finding will increase overall repository health and reliability.',
          how: 'Follow best practices for this metric.',
        };

        const effortWeight = EFFORT_WEIGHTS[template.effort];
        const priority = Number((pointsGain / effortWeight).toFixed(2));
        const id = `fix-${signal.id.replace(/\./g, '-')}`;

        fixes.push({
          id,
          signalId: signal.id,
          title: template.title,
          why: template.why,
          how: template.how,
          pointsGain,
          effort: template.effort,
          priority,
        });
      }
    }
  }

  // Sort by priority descending, ties by pointsGain descending
  fixes.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return b.pointsGain - a.pointsGain;
  });

  return fixes;
}
