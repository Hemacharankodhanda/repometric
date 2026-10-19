import type { SignalResult } from '../../types';
import { clamp01 } from '../config';
import type { Signal, SignalContext } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * community.bus_factor:
 * share = top author's share of commits in last 365 days.
 * 7 * clamp01((0.95 - share) / 0.45).
 * Evidence mentions "solo project" if only one author. Max 7.
 */
export const busFactorSignal: Signal = {
  id: 'community.bus_factor',
  categoryId: 'community',
  label: 'Bus factor risk',
  max: 7,
  compute({ snapshot, now }: SignalContext): SignalResult {
    const nowMs = now.getTime();
    const cutoff365d = nowMs - 365 * MS_PER_DAY;

    const recentCommits = snapshot.commits.filter((c) => {
      const commitTime = new Date(c.date).getTime();
      return commitTime >= cutoff365d && commitTime <= nowMs;
    });

    if (recentCommits.length === 0) {
      return {
        id: 'community.bus_factor',
        categoryId: 'community',
        label: 'Bus factor risk',
        earned: 3.5,
        max: 7,
        status: 'no_data',
        evidence: 'No commits in the last 365 days to measure author concentration.',
      };
    }

    const authorCounts = new Map<string, number>();
    for (const c of recentCommits) {
      const author = c.authorLogin ?? 'unknown';
      authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
    }

    let topAuthorCommits = 0;
    for (const count of authorCounts.values()) {
      if (count > topAuthorCommits) {
        topAuthorCommits = count;
      }
    }

    const share = topAuthorCommits / recentCommits.length;
    const earned = Number((7 * clamp01((0.95 - share) / 0.45)).toFixed(2));
    const status = earned === 7 ? 'pass' : earned === 0 ? 'fail' : 'partial';
    const pct = Math.round(share * 100);

    const isSolo = authorCounts.size <= 1;
    let evidence = `Top author contributed ${pct}% of commits in the last year (${recentCommits.length} commits total).`;
    if (isSolo) {
      evidence = `Solo project with 1 author contributing 100% of commits in the last year.`;
    }

    return {
      id: 'community.bus_factor',
      categoryId: 'community',
      label: 'Bus factor risk',
      earned,
      max: 7,
      status,
      evidence,
    };
  },
};

/**
 * community.contributors:
 * Distinct commit authors in last 365 days n:
 * 4 * clamp01((n - 1) / 4). Max 4.
 */
export const contributorsSignal: Signal = {
  id: 'community.contributors',
  categoryId: 'community',
  label: 'Active contributors',
  max: 4,
  compute({ snapshot, now }: SignalContext): SignalResult {
    const nowMs = now.getTime();
    const cutoff365d = nowMs - 365 * MS_PER_DAY;

    const recentCommits = snapshot.commits.filter((c) => {
      const commitTime = new Date(c.date).getTime();
      return commitTime >= cutoff365d && commitTime <= nowMs;
    });

    const authors = new Set<string>();
    for (const c of recentCommits) {
      if (c.authorLogin) {
        authors.add(c.authorLogin.toLowerCase());
      }
    }

    const n = authors.size;
    const earned = Number((4 * clamp01((n - 1) / 4)).toFixed(2));
    const status = earned === 4 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    return {
      id: 'community.contributors',
      categoryId: 'community',
      label: 'Active contributors',
      earned,
      max: 4,
      status,
      evidence:
        n === 0
          ? 'No active contributors in the last 365 days.'
          : `${n} distinct contributor${n === 1 ? '' : 's'} in the last 365 days (target: 5+).`,
    };
  },
};

/**
 * community.files:
 * CONTRIBUTING* is 2, CODE_OF_CONDUCT* is 1,
 * issue or PR template (.github/ISSUE_TEMPLATE/**, .github/pull_request_template.md) is 1. Max 4.
 */
export const communityFilesSignal: Signal = {
  id: 'community.files',
  categoryId: 'community',
  label: 'Community guidelines & templates',
  max: 4,
  compute({ snapshot }: SignalContext): SignalResult {
    const hasContributing = snapshot.tree.some((f) =>
      /(^|\/)contributing(\.[a-z0-9_-]+)?$/i.test(f.path),
    );
    const hasCodeOfConduct = snapshot.tree.some((f) =>
      /(^|\/)code_of_conduct(\.[a-z0-9_-]+)?$/i.test(f.path),
    );
    const hasTemplates = snapshot.tree.some((f) =>
      /^\.github\/(issue_template\/|pull_request_template\.(md|ya?ml)$)/i.test(f.path),
    );

    let earned = 0;
    const found: string[] = [];
    if (hasContributing) {
      earned += 2;
      found.push('CONTRIBUTING');
    }
    if (hasCodeOfConduct) {
      earned += 1;
      found.push('CODE_OF_CONDUCT');
    }
    if (hasTemplates) {
      earned += 1;
      found.push('issue/PR templates');
    }

    const status = earned === 4 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    return {
      id: 'community.files',
      categoryId: 'community',
      label: 'Community guidelines & templates',
      earned,
      max: 4,
      status,
      evidence:
        found.length > 0
          ? `Found community files: ${found.join(', ')}.`
          : 'No CONTRIBUTING, CODE_OF_CONDUCT, or issue templates detected.',
    };
  },
};
