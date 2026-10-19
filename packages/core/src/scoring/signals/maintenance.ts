import type { SignalResult } from '../../types';
import { clamp01 } from '../config';
import type { Signal, SignalContext } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Filter helper: only consider issues and PRs created in the last 180 days
 * by someone other than the repo owner and not a bot (login ends with [bot]).
 */
function isQualifyingItem(
  item: { author: string | null; createdAt: string },
  owner: string,
  nowMs: number,
  cutoff180d: number,
): boolean {
  if (!item.author) return false;
  const login = item.author.toLowerCase();
  if (login === owner.toLowerCase() || login.endsWith('[bot]')) return false;

  const createdTime = new Date(item.createdAt).getTime();
  return createdTime >= cutoff180d && createdTime <= nowMs;
}

/**
 * maintenance.first_response:
 * Median hours to first response by someone other than the author:
 * <=48 gives 8, <=168 gives 6, <=720 gives 3, else 0.
 * No qualifying items: no_data (earns 50% = 4 points). Max 8.
 */
export const firstResponseSignal: Signal = {
  id: 'maintenance.first_response',
  categoryId: 'maintenance',
  label: 'Issue response time',
  max: 8,
  compute({ snapshot, now }: SignalContext): SignalResult {
    const nowMs = now.getTime();
    const cutoff180d = nowMs - 180 * MS_PER_DAY;
    const owner = snapshot.meta.owner;

    // Filter qualifying issues and PRs
    const qualifyingIssues = snapshot.issues.filter((i) =>
      isQualifyingItem(i, owner, nowMs, cutoff180d),
    );
    const qualifyingPulls = snapshot.pulls.filter((p) =>
      isQualifyingItem(p, owner, nowMs, cutoff180d),
    );

    const qualifyingItems = [...qualifyingIssues, ...qualifyingPulls];

    if (qualifyingItems.length === 0) {
      return {
        id: 'maintenance.first_response',
        categoryId: 'maintenance',
        label: 'Issue response time',
        earned: 4,
        max: 8,
        status: 'no_data',
        evidence: 'No external issues or pull requests opened in the last 180 days to measure response time.',
      };
    }

    // Calculate response durations in hours
    const responseHours: number[] = [];
    for (const item of qualifyingItems) {
      if (item.firstResponseAt) {
        const createdMs = new Date(item.createdAt).getTime();
        const respMs = new Date(item.firstResponseAt).getTime();
        const hours = Math.max(0, (respMs - createdMs) / MS_PER_HOUR);
        responseHours.push(hours);
      } else {
        // Unanswered: measure elapsed time up to now
        const createdMs = new Date(item.createdAt).getTime();
        const hours = Math.max(0, (nowMs - createdMs) / MS_PER_HOUR);
        responseHours.push(hours);
      }
    }

    responseHours.sort((a, b) => a - b);
    const mid = Math.floor(responseHours.length / 2);
    const medianHours =
      responseHours.length % 2 !== 0
        ? responseHours[mid]
        : (responseHours[mid - 1] + responseHours[mid]) / 2;

    let earned = 0;
    if (medianHours <= 48) {
      earned = 8;
    } else if (medianHours <= 168) {
      earned = 6;
    } else if (medianHours <= 720) {
      earned = 3;
    } else {
      earned = 0;
    }

    const roundedHours = Math.round(medianHours);
    const status = earned === 8 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    return {
      id: 'maintenance.first_response',
      categoryId: 'maintenance',
      label: 'Issue response time',
      earned,
      max: 8,
      status,
      evidence:
        medianHours <= 48
          ? `Median response time is ${roundedHours} hours (under 48 hours).`
          : `Median response time is ${roundedHours} hours (~${Math.round(roundedHours / 24)} days).`,
    };
  },
};

/**
 * maintenance.stale_issues:
 * ratio = openIssuesNotUpdatedIn90Days / openIssues.
 * 6 * (1 - clamp01((ratio - 0.10) / 0.50)).
 * Zero open issues: pass. Max 6.
 */
export const staleIssuesSignal: Signal = {
  id: 'maintenance.stale_issues',
  categoryId: 'maintenance',
  label: 'Stale issue ratio',
  max: 6,
  compute({ snapshot, now }: SignalContext): SignalResult {
    const openIssues = snapshot.issues.filter((i) => i.state === 'open');

    if (openIssues.length === 0) {
      return {
        id: 'maintenance.stale_issues',
        categoryId: 'maintenance',
        label: 'Stale issue ratio',
        earned: 6,
        max: 6,
        status: 'pass',
        evidence: 'Zero open issues in repository.',
      };
    }

    const nowMs = now.getTime();
    const cutoff90d = nowMs - 90 * MS_PER_DAY;

    const staleCount = openIssues.filter((i) => {
      const updatedTime = new Date(i.updatedAt).getTime();
      return updatedTime < cutoff90d;
    }).length;

    const ratio = staleCount / openIssues.length;
    const earned = Number((6 * (1 - clamp01((ratio - 0.1) / 0.5))).toFixed(2));
    const status = earned === 6 ? 'pass' : earned === 0 ? 'fail' : 'partial';
    const stalePct = Math.round(ratio * 100);

    return {
      id: 'maintenance.stale_issues',
      categoryId: 'maintenance',
      label: 'Stale issue ratio',
      earned,
      max: 6,
      status,
      evidence:
        staleCount === 0
          ? 'No open issues have been inactive for over 90 days.'
          : `${staleCount} of ${openIssues.length} open issues (${stalePct}%) inactive for 90+ days.`,
    };
  },
};

/**
 * maintenance.pr_merge_rate:
 * Among PRs closed in last 180 days:
 * 6 * clamp01((merged / closed) / 0.70).
 * None closed: no_data (earns 3 points). Max 6.
 */
export const prMergeRateSignal: Signal = {
  id: 'maintenance.pr_merge_rate',
  categoryId: 'maintenance',
  label: 'PR merge rate',
  max: 6,
  compute({ snapshot, now }: SignalContext): SignalResult {
    const nowMs = now.getTime();
    const cutoff180d = nowMs - 180 * MS_PER_DAY;

    const closedPrs = snapshot.pulls.filter((p) => {
      if (!p.closedAt) return false;
      const closedMs = new Date(p.closedAt).getTime();
      return closedMs >= cutoff180d && closedMs <= nowMs;
    });

    if (closedPrs.length === 0) {
      return {
        id: 'maintenance.pr_merge_rate',
        categoryId: 'maintenance',
        label: 'PR merge rate',
        earned: 3,
        max: 6,
        status: 'no_data',
        evidence: 'No pull requests were closed in the last 180 days to measure merge rate.',
      };
    }

    const mergedCount = closedPrs.filter((p) => p.merged).length;
    const mergeRatio = mergedCount / closedPrs.length;
    const earned = Number((6 * clamp01(mergeRatio / 0.7)).toFixed(2));
    const status = earned === 6 ? 'pass' : earned === 0 ? 'fail' : 'partial';
    const pct = Math.round(mergeRatio * 100);

    return {
      id: 'maintenance.pr_merge_rate',
      categoryId: 'maintenance',
      label: 'PR merge rate',
      earned,
      max: 6,
      status,
      evidence: `${mergedCount} of ${closedPrs.length} closed PRs (${pct}%) merged in the last 180 days (target: 70%+).`,
    };
  },
};
