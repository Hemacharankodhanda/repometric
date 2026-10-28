export interface ParsedManifest {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  isPinnedLockfile?: boolean;
}

/**
 * Parses a package.json file string.
 */
export function parsePackageJson(content: string | null): ParsedManifest {
  if (!content) return { dependencies: {}, devDependencies: {} };
  try {
    const parsed = JSON.parse(content);
    return {
      dependencies:
        typeof parsed.dependencies === 'object' && parsed.dependencies !== null
          ? parsed.dependencies
          : {},
      devDependencies:
        typeof parsed.devDependencies === 'object' && parsed.devDependencies !== null
          ? parsed.devDependencies
          : {},
    };
  } catch {
    return { dependencies: {}, devDependencies: {} };
  }
}

/**
 * Parses a requirements.txt file string.
 * Calculates whether >= 80% of lines are pinned with == (qualifies as lockfile).
 */
export function parseRequirementsTxt(content: string | null): ParsedManifest {
  if (!content) return { dependencies: {}, devDependencies: {}, isPinnedLockfile: false };

  const dependencies: Record<string, string> = {};
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('-'));

  if (lines.length === 0) {
    return { dependencies: {}, devDependencies: {}, isPinnedLockfile: false };
  }

  let pinnedCount = 0;

  for (const line of lines) {
    // Strip inline comments
    const cleanLine = line.split('#')[0].trim();
    if (!cleanLine) continue;

    // Matches name==version, name[extra]==version, name>=version, name
    const match = cleanLine.match(/^([a-zA-Z0-9_.-]+)(?:\[.*?\])?\s*([~>=<!=].*)?$/);
    if (match) {
      const name = match[1];
      const specifier = match[2]?.trim() || '*';
      dependencies[name] = specifier;

      if (specifier.startsWith('==')) {
        pinnedCount++;
      }
    }
  }

  const isPinnedLockfile = lines.length > 0 && pinnedCount / lines.length >= 0.8;

  return {
    dependencies,
    devDependencies: {},
    isPinnedLockfile,
  };
}

/**
 * Parses PEP 621 or Poetry dependencies from pyproject.toml.
 */
export function parsePyprojectToml(content: string | null): ParsedManifest {
  if (!content) return { dependencies: {}, devDependencies: {} };

  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};

  const lines = content.split(/\r?\n/);
  let currentSection = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Check for section headers [section] or [[section]]
    const sectionMatch = line.match(/^\[{1,2}([^\]]+)\]{1,2}$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    // PEP 621 [project] dependencies = [ "requests>=2.28.0", ... ]
    if (currentSection === 'project' && line.startsWith('dependencies')) {
      // Handled if inline array or multi-line
      continue;
    }

    // Items inside PEP 621 dependencies array: "package[extra]>=1.0.0"
    if (
      currentSection === 'project.dependencies' ||
      currentSection === 'project.optional-dependencies' ||
      currentSection === 'project'
    ) {
      const itemMatch = line.match(
        /^["']([a-zA-Z0-9_.-]+)(?:\[.*?\])?\s*([~>=<!=][^"';]*)?(?:;.*)?["']/,
      );
      if (itemMatch) {
        const name = itemMatch[1];
        const range = itemMatch[2]?.trim() || '*';
        if (currentSection.includes('optional') || currentSection.includes('dev')) {
          devDependencies[name] = range;
        } else {
          dependencies[name] = range;
        }
        continue;
      }
    }

    // Poetry style: [tool.poetry.dependencies] key = "^1.2.3" or { version = "^1.2.3" }
    if (currentSection === 'tool.poetry.dependencies') {
      const kvMatch = line.match(/^([a-zA-Z0-9_.-]+)\s*=\s*(.*)$/);
      if (kvMatch) {
        const name = kvMatch[1];
        if (name.toLowerCase() === 'python') continue; // Skip python runtime spec

        const val = kvMatch[2].trim();
        // String value: "^1.0.0"
        const strMatch = val.match(/^["']([^"']+)["']/);
        if (strMatch) {
          dependencies[name] = strMatch[1];
        } else if (val.includes('version')) {
          // Object: { version = "^1.0.0", optional = true }
          const verMatch = val.match(/version\s*=\s*["']([^"']+)["']/);
          if (verMatch) {
            dependencies[name] = verMatch[1];
          }
        }
        continue;
      }
    }

    // Poetry dev group: [tool.poetry.group.dev.dependencies]
    if (currentSection.startsWith('tool.poetry.group') && currentSection.endsWith('dependencies')) {
      const kvMatch = line.match(/^([a-zA-Z0-9_.-]+)\s*=\s*(.*)$/);
      if (kvMatch) {
        const name = kvMatch[1];
        const val = kvMatch[2].trim();
        const strMatch = val.match(/^["']([^"']+)["']/);
        if (strMatch) {
          devDependencies[name] = strMatch[1];
        }
      }
    }
  }

  return { dependencies, devDependencies };
}
