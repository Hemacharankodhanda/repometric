import type { SignalResult } from '../../types';
import { clamp01 } from '../config';
import type { Signal, SignalContext } from '../types';

/**
 * Parses the major version from a semver string or range.
 * e.g. "^18.2.0" -> 18, ">=2.0.0" -> 2, "1.0.0" -> 1
 */
export function parseMajorVersion(versionStr: string): number | null {
  const match = versionStr.match(/(\d+)\.\d+/);
  if (match) {
    return parseInt(match[1], 10);
  }
  const singleMatch = versionStr.match(/^\s*[~^>=<]*\s*(\d+)/);
  return singleMatch ? parseInt(singleMatch[1], 10) : null;
}

const LOCKFILE_PATTERNS = [
  /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|poetry\.lock|Pipfile\.lock|uv\.lock)$/i,
];

/**
 * deps.lockfile:
 * Lockfile present (package-lock.json, pnpm-lock.yaml, yarn.lock, bun.lockb,
 * poetry.lock, Pipfile.lock, uv.lock), or a requirements.txt where at least 80%
 * of lines are pinned with ==. Max 3.
 * No manifest makes signal 'na'.
 */
export const lockfileSignal: Signal = {
  id: 'deps.lockfile',
  categoryId: 'dependencies',
  label: 'Lockfile presence',
  max: 3,
  compute({ snapshot }: SignalContext): SignalResult {
    if (!snapshot.manifests || snapshot.manifests.length === 0) {
      return {
        id: 'deps.lockfile',
        categoryId: 'dependencies',
        label: 'Lockfile presence',
        earned: 0,
        max: 3,
        status: 'na',
        evidence: 'No dependency manifests found in repository.',
      };
    }

    const hasManifestLockfile = snapshot.manifests.some((m) => m.hasLockfile);
    const hasTreeLockfile = snapshot.tree.some((f) =>
      LOCKFILE_PATTERNS.some((p) => p.test(f.path)),
    );

    // Check requirements.txt pinned lines if sampled
    let hasPinnedRequirements = false;
    const reqFile = snapshot.sampledSources?.find((f) => /(^|\/)requirements\.txt$/i.test(f.path));
    if (reqFile) {
      const lines = reqFile.content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
      if (lines.length > 0) {
        const pinnedCount = lines.filter((l) => l.includes('==')).length;
        if (pinnedCount / lines.length >= 0.8) {
          hasPinnedRequirements = true;
        }
      }
    }

    const passes = hasManifestLockfile || hasTreeLockfile || hasPinnedRequirements;
    const earned = passes ? 3 : 0;
    const status = passes ? 'pass' : 'fail';

    return {
      id: 'deps.lockfile',
      categoryId: 'dependencies',
      label: 'Lockfile presence',
      earned,
      max: 3,
      status,
      evidence: passes
        ? 'Lockfile is committed to ensure deterministic builds.'
        : 'No lockfile found (e.g. package-lock.json, pnpm-lock.yaml, yarn.lock, poetry.lock).',
    };
  },
};

/**
 * deps.outdated:
 * Over up to 50 direct dependencies (runtime and dev, alphabetical):
 * behind = declared major is lower than registry latest major.
 * ratio = behind / total.
 * 5 * (1 - clamp01((ratio - 0.10) / 0.50)).
 * Zero dependencies: na. Max 5.
 */
export const outdatedDepsSignal: Signal = {
  id: 'deps.outdated',
  categoryId: 'dependencies',
  label: 'Dependency freshness',
  max: 5,
  compute({ snapshot }: SignalContext): SignalResult {
    if (!snapshot.manifests || snapshot.manifests.length === 0) {
      return {
        id: 'deps.outdated',
        categoryId: 'dependencies',
        label: 'Dependency freshness',
        earned: 0,
        max: 5,
        status: 'na',
        evidence: 'No dependency manifests found in repository.',
      };
    }

    // Collect all direct dependencies
    const allDeps: { name: string; range: string; ecosystem: 'npm' | 'pypi' }[] = [];
    for (const m of snapshot.manifests) {
      for (const [name, range] of Object.entries(m.dependencies)) {
        allDeps.push({ name, range, ecosystem: m.ecosystem });
      }
      for (const [name, range] of Object.entries(m.devDependencies)) {
        allDeps.push({ name, range, ecosystem: m.ecosystem });
      }
    }

    if (allDeps.length === 0) {
      return {
        id: 'deps.outdated',
        categoryId: 'dependencies',
        label: 'Dependency freshness',
        earned: 0,
        max: 5,
        status: 'na',
        evidence: 'No direct dependencies declared in manifests.',
      };
    }

    // Sort alphabetically and take up to 50
    allDeps.sort((a, b) => a.name.localeCompare(b.name));
    const sampled = allDeps.slice(0, 50);

    let behindCount = 0;
    for (const dep of sampled) {
      const regKey = `${dep.ecosystem}:${dep.name}`;
      const regInfo = snapshot.registry?.[regKey];
      if (regInfo && regInfo.latest) {
        const declaredMajor = parseMajorVersion(dep.range);
        const latestMajor = parseMajorVersion(regInfo.latest);
        if (
          declaredMajor !== null &&
          latestMajor !== null &&
          latestMajor > declaredMajor
        ) {
          behindCount++;
        }
      }
    }

    const ratio = behindCount / sampled.length;
    const earned = Number((5 * (1 - clamp01((ratio - 0.1) / 0.5))).toFixed(2));
    const status = earned === 5 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    return {
      id: 'deps.outdated',
      categoryId: 'dependencies',
      label: 'Dependency freshness',
      earned,
      max: 5,
      status,
      evidence:
        behindCount === 0
          ? `All ${sampled.length} evaluated dependencies are on their latest major version.`
          : `${behindCount} of ${sampled.length} evaluated dependencies (${Math.round(ratio * 100)}%) are behind by at least one major version.`,
    };
  },
};

/**
 * deps.deprecated:
 * 0 if any direct dependency is marked deprecated by its registry, else 2. Max 2.
 * Zero manifests: na.
 */
export const deprecatedDepsSignal: Signal = {
  id: 'deps.deprecated',
  categoryId: 'dependencies',
  label: 'Deprecated packages',
  max: 2,
  compute({ snapshot }: SignalContext): SignalResult {
    if (!snapshot.manifests || snapshot.manifests.length === 0) {
      return {
        id: 'deps.deprecated',
        categoryId: 'dependencies',
        label: 'Deprecated packages',
        earned: 0,
        max: 2,
        status: 'na',
        evidence: 'No dependency manifests found in repository.',
      };
    }

    const deprecatedPackages: string[] = [];
    for (const m of snapshot.manifests) {
      for (const name of Object.keys(m.dependencies)) {
        const regKey = `${m.ecosystem}:${name}`;
        if (snapshot.registry?.[regKey]?.deprecated) {
          deprecatedPackages.push(name);
        }
      }
      for (const name of Object.keys(m.devDependencies)) {
        const regKey = `${m.ecosystem}:${name}`;
        if (snapshot.registry?.[regKey]?.deprecated) {
          deprecatedPackages.push(name);
        }
      }
    }

    const hasDeprecated = deprecatedPackages.length > 0;
    const earned = hasDeprecated ? 0 : 2;
    const status = hasDeprecated ? 'fail' : 'pass';

    return {
      id: 'deps.deprecated',
      categoryId: 'dependencies',
      label: 'Deprecated packages',
      earned,
      max: 2,
      status,
      evidence: hasDeprecated
        ? `Found deprecated package(s) on registry: ${deprecatedPackages.join(', ')}.`
        : 'No deprecated dependencies found on package registry.',
    };
  },
};
