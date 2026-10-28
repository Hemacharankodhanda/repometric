import type { SignalResult } from '../../types';
import { clamp01 } from '../config';
import type { Signal, SignalContext } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * activity.commits_90d:
 * 8 * clamp01(commitsLast90Days / 30)
 */
export const commits90dSignal: Signal = {
  id: 'activity.commits_90d',
  categoryId: 'activity',
  label: 'Commit cadence (last 90 days)',
  max: 8,
  compute({ snapshot, now }: SignalContext): SignalResult {
    const nowMs = now.getTime();
    const cutoffMs = nowMs - 90 * MS_PER_DAY;

    const count90d = snapshot.commits.filter((c) => {
      const commitTime = new Date(c.date).getTime();
      return commitTime >= cutoffMs && commitTime <= nowMs;
    }).length;

    const earned = Number((8 * clamp01(count90d / 30)).toFixed(2));
    const status = earned === 8 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    return {
      id: 'activity.commits_90d',
      categoryId: 'activity',
      label: 'Commit cadence (last 90 days)',
      earned,
      max: 8,
      status,
      evidence: `${count90d} commit${count90d === 1 ? '' : 's'} in the last 90 days (target: 30+).`,
    };
  },
};

/**
 * activity.last_commit:
 * Days since last commit: <=14 gives 6, <=30 gives 5, <=90 gives 3, <=180 gives 1, else 0
 */
export const lastCommitSignal: Signal = {
  id: 'activity.last_commit',
  categoryId: 'activity',
  label: 'Recency of last commit',
  max: 6,
  compute({ snapshot, now }: SignalContext): SignalResult {
    if (snapshot.commits.length === 0) {
      return {
        id: 'activity.last_commit',
        categoryId: 'activity',
        label: 'Recency of last commit',
        earned: 0,
        max: 6,
        status: 'fail',
        evidence: 'No commits recorded in the repository.',
      };
    }

    // Find most recent commit date
    let latestMs = -Infinity;
    for (const c of snapshot.commits) {
      const time = new Date(c.date).getTime();
      if (time > latestMs) {
        latestMs = time;
      }
    }

    const diffDays = Math.max(0, (now.getTime() - latestMs) / MS_PER_DAY);

    let earned = 0;
    if (diffDays <= 14) {
      earned = 6;
    } else if (diffDays <= 30) {
      earned = 5;
    } else if (diffDays <= 90) {
      earned = 3;
    } else if (diffDays <= 180) {
      earned = 1;
    } else {
      earned = 0;
    }

    const roundedDays = Math.floor(diffDays);
    const status = earned === 6 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    return {
      id: 'activity.last_commit',
      categoryId: 'activity',
      label: 'Recency of last commit',
      earned,
      max: 6,
      status,
      evidence:
        roundedDays === 0
          ? 'Last commit was today.'
          : `Last commit was ${roundedDays} day${roundedDays === 1 ? '' : 's'} ago.`,
    };
  },
};

/**
 * activity.releases:
 * Releases plus tags in last 365 days: 0 gives 0, 1-2 gives 3, 3 or more gives 6
 */
export const releasesSignal: Signal = {
  id: 'activity.releases',
  categoryId: 'activity',
  label: 'Release cadence',
  max: 6,
  compute({ snapshot, now }: SignalContext): SignalResult {
    const nowMs = now.getTime();
    const cutoffMs = nowMs - 365 * MS_PER_DAY;

    const count365d = snapshot.releases.filter((r) => {
      const releaseTime = new Date(r.publishedAt).getTime();
      return releaseTime >= cutoffMs && releaseTime <= nowMs;
    }).length;

    let earned = 0;
    if (count365d >= 3) {
      earned = 6;
    } else if (count365d >= 1) {
      earned = 3;
    } else {
      earned = 0;
    }

    const status = earned === 6 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    return {
      id: 'activity.releases',
      categoryId: 'activity',
      label: 'Release cadence',
      earned,
      max: 6,
      status,
      evidence:
        count365d === 0
          ? 'No releases or tags published in the last 365 days.'
          : `${count365d} release${count365d === 1 ? '' : 's'} published in the last 365 days.`,
    };
  },
};

export const ACTIVITY_SIGNALS: Signal[] = [commits90dSignal, lastCommitSignal, releasesSignal];
