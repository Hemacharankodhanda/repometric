export interface PackageRegistryInfo {
  latest: string;
  deprecated: boolean;
}

export interface RegistryLookupItem {
  name: string;
  ecosystem: 'npm' | 'pypi';
}

export interface RegistryClientOptions {
  fetch?: typeof fetch;
  concurrency?: number;
}

/**
 * Concurrency runner limiting simultaneous async tasks.
 */
async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await fn(items[index]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Fetches package info from npm registry: https://registry.npmjs.org/{name}
 */
export async function fetchNpmPackageInfo(
  name: string,
  fetchFn: typeof fetch = globalThis.fetch,
): Promise<PackageRegistryInfo | null> {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  try {
    const res = await fetchFn(url, {
      headers: { Accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8' },
    });
    if (!res.ok) return null;
    const data = await res.json();

    const latest = data['dist-tags']?.latest || '';
    if (!latest) return null;

    // Check deprecated on latest version or top-level
    const versionObj = data.versions?.[latest];
    const isDeprecated = Boolean(versionObj?.deprecated || data.deprecated);

    return {
      latest,
      deprecated: isDeprecated,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches package info from PyPI registry: https://pypi.org/pypi/{name}/json
 */
export async function fetchPyPiPackageInfo(
  name: string,
  fetchFn: typeof fetch = globalThis.fetch,
): Promise<PackageRegistryInfo | null> {
  const url = `https://pypi.org/pypi/${encodeURIComponent(name)}/json`;
  try {
    const res = await fetchFn(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();

    const latest = data.info?.version || '';
    if (!latest) return null;

    // Check if yanked or marked inactive/deprecated in classifiers
    const yanked = Boolean(data.info?.yanked);
    const classifiers: string[] = data.info?.classifiers || [];
    const isInactive = classifiers.some(
      (c) =>
        c.includes('Development Status :: 7 - Inactive') ||
        c.toLowerCase().includes('deprecated'),
    );

    return {
      latest,
      deprecated: yanked || isInactive,
    };
  } catch {
    return null;
  }
}

/**
 * Looks up a list of dependencies across npm and PyPI with concurrency 8.
 * Returns record keyed by "npm:name" or "pypi:name".
 */
export async function lookupDependencies(
  items: RegistryLookupItem[],
  options: RegistryClientOptions = {},
): Promise<Record<string, PackageRegistryInfo>> {
  const fetchFn = options.fetch || globalThis.fetch;
  const concurrency = options.concurrency ?? 8;

  // Deduplicate items
  const uniqueMap = new Map<string, RegistryLookupItem>();
  for (const item of items) {
    const key = `${item.ecosystem}:${item.name}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  const uniqueList = Array.from(uniqueMap.values());
  const registryResults: Record<string, PackageRegistryInfo> = {};

  await mapConcurrent(uniqueList, concurrency, async (item) => {
    const key = `${item.ecosystem}:${item.name}`;
    let info: PackageRegistryInfo | null = null;
    if (item.ecosystem === 'npm') {
      info = await fetchNpmPackageInfo(item.name, fetchFn);
    } else if (item.ecosystem === 'pypi') {
      info = await fetchPyPiPackageInfo(item.name, fetchFn);
    }

    if (info) {
      registryResults[key] = info;
    }
  });

  return registryResults;
}
