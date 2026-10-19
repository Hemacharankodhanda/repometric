import type { FileNode, SignalResult } from '../../types';
import type { Signal, SignalContext } from '../types';

/**
 * Checks if a file path is a test file.
 */
export function isTestFilePath(path: string): boolean {
  return (
    /(^|\/)(__tests__|tests|test|specs|spec)\//i.test(path) ||
    /\.(test|spec)\.[a-z0-9]+$/i.test(path) ||
    /(^|\/)(test_[^/]+\.py|[^/]+_test\.(py|go|ts|js|rs))$/i.test(path)
  );
}

/**
 * hygiene.tests:
 * Count test files: 3 or more gives 4, 1-2 gives 2, 0 gives 0. Max 4.
 */
export const testsSignal: Signal = {
  id: 'hygiene.tests',
  categoryId: 'hygiene',
  label: 'Test suite presence',
  max: 4,
  compute({ snapshot }: SignalContext): SignalResult {
    const testFiles = snapshot.tree.filter((f) => f.isTest || isTestFilePath(f.path));
    const count = testFiles.length;

    let earned = 0;
    if (count >= 3) {
      earned = 4;
    } else if (count >= 1) {
      earned = 2;
    } else {
      earned = 0;
    }

    const status = earned === 4 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    return {
      id: 'hygiene.tests',
      categoryId: 'hygiene',
      label: 'Test suite presence',
      earned,
      max: 4,
      status,
      evidence:
        count === 0
          ? 'No test files detected in repository.'
          : `${count} test file${count === 1 ? '' : 's'} found across repository (target: 3+).`,
    };
  },
};

/**
 * Checks if a file path represents a continuous integration configuration.
 */
export function isCiConfigPath(path: string): boolean {
  return (
    /^\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(path) ||
    /^\.gitlab-ci\.(ya?ml)$/i.test(path) ||
    /^\.circleci\/config\.(ya?ml)$/i.test(path) ||
    /^azure-pipelines\.(ya?ml)$/i.test(path) ||
    /^jenkinsfile$/i.test(path)
  );
}

/**
 * hygiene.ci:
 * Any of .github/workflows/*.yml, .gitlab-ci.yml, .circleci/config.yml, azure-pipelines.yml, Jenkinsfile: 4, else 0.
 */
export const ciSignal: Signal = {
  id: 'hygiene.ci',
  categoryId: 'hygiene',
  label: 'Continuous integration (CI)',
  max: 4,
  compute({ snapshot }: SignalContext): SignalResult {
    const ciFile = snapshot.tree.find((f) => isCiConfigPath(f.path));
    const hasCi = Boolean(ciFile);
    const earned = hasCi ? 4 : 0;
    const status = hasCi ? 'pass' : 'fail';

    return {
      id: 'hygiene.ci',
      categoryId: 'hygiene',
      label: 'Continuous integration (CI)',
      earned,
      max: 4,
      status,
      evidence: hasCi
        ? `CI workflow configuration found (${ciFile?.path}).`
        : 'No continuous integration configuration detected.',
    };
  },
};

/**
 * Checks if a file path is a linter or formatter configuration.
 */
export function isLintFormatPath(path: string): boolean {
  const basename = path.split('/').pop()?.toLowerCase() ?? '';
  return (
    // ESLint
    /^\.eslintrc(\.[a-z0-9]+)?$/i.test(basename) ||
    /^eslint\.config\.[a-z0-9]+$/i.test(basename) ||
    // Prettier
    /^\.prettierrc(\.[a-z0-9]+)?$/i.test(basename) ||
    /^prettier\.config\.[a-z0-9]+$/i.test(basename) ||
    // Biome
    /^biome\.jsonc?$/i.test(basename) ||
    // EditorConfig
    basename === '.editorconfig' ||
    // Python linters
    basename === 'ruff.toml' ||
    basename === '.flake8'
  );
}

/**
 * hygiene.lint_format:
 * Any of ESLint, Prettier, Biome, .editorconfig, ruff.toml, .flake8,
 * or [tool.ruff] / [tool.black] in pyproject.toml: 2, else 0.
 */
export const lintFormatSignal: Signal = {
  id: 'hygiene.lint_format',
  categoryId: 'hygiene',
  label: 'Linter & formatter configuration',
  max: 2,
  compute({ snapshot }: SignalContext): SignalResult {
    const configPath = snapshot.tree.find((f) => isLintFormatPath(f.path));

    // Check pyproject.toml contents if available in sampledSources
    let hasPyprojectTool = false;
    const pyprojectFile = snapshot.sampledSources?.find((f) => /(^|\/)pyproject\.toml$/i.test(f.path));
    if (pyprojectFile) {
      hasPyprojectTool = /\[tool\.(ruff|black)\]/i.test(pyprojectFile.content);
    }

    const passes = Boolean(configPath) || hasPyprojectTool;
    const earned = passes ? 2 : 0;
    const status = passes ? 'pass' : 'fail';

    return {
      id: 'hygiene.lint_format',
      categoryId: 'hygiene',
      label: 'Linter & formatter configuration',
      earned,
      max: 2,
      status,
      evidence: passes
        ? `Linter / formatter configuration found (${configPath?.path ?? 'pyproject.toml'}).`
        : 'No linter or formatter configuration detected.',
    };
  },
};

/**
 * hygiene.gitignore:
 * .gitignore at root: 1, else 0.
 */
export const gitignoreSignal: Signal = {
  id: 'hygiene.gitignore',
  categoryId: 'hygiene',
  label: '.gitignore presence',
  max: 1,
  compute({ snapshot }: SignalContext): SignalResult {
    const hasGitignore = snapshot.tree.some((f) => f.path.toLowerCase() === '.gitignore');
    const earned = hasGitignore ? 1 : 0;
    const status = hasGitignore ? 'pass' : 'fail';

    return {
      id: 'hygiene.gitignore',
      categoryId: 'hygiene',
      label: '.gitignore presence',
      earned,
      max: 1,
      status,
      evidence: hasGitignore
        ? '.gitignore file found at repository root.'
        : 'No .gitignore file found at repository root.',
    };
  },
};

/**
 * Checks if a path is a root LICENSE or COPYING file.
 */
export function isRootLicense(path: string): boolean {
  return /^(license|copying)(\.[a-z0-9_-]+)?$/i.test(path);
}

/**
 * hygiene.license:
 * LICENSE* or COPYING* at root, or meta.license set: 2, else 0.
 */
export const licenseSignal: Signal = {
  id: 'hygiene.license',
  categoryId: 'hygiene',
  label: 'Software license',
  max: 2,
  compute({ snapshot }: SignalContext): SignalResult {
    const hasLicenseFile = snapshot.tree.some((f) => isRootLicense(f.path));
    const hasMetaLicense = Boolean(snapshot.meta.license && snapshot.meta.license.trim().length > 0);

    const passes = hasLicenseFile || hasMetaLicense;
    const earned = passes ? 2 : 0;
    const status = passes ? 'pass' : 'fail';

    return {
      id: 'hygiene.license',
      categoryId: 'hygiene',
      label: 'Software license',
      earned,
      max: 2,
      status,
      evidence: passes
        ? `License verified (${snapshot.meta.license ?? 'root license file'}).`
        : 'No license file or repository license found.',
    };
  },
};

const SECRET_EXCEPTIONS = new Set(['.env.example', '.env.sample', '.env.template']);

/**
 * Checks if a file path matches secret naming patterns:
 * .env, .env.* (except .env.example, .env.sample, .env.template)
 * *.pem, id_rsa*, *.p12, *.keystore, credentials.json
 */
export function isSecretPath(path: string): boolean {
  const basename = path.split('/').pop()?.toLowerCase() ?? '';

  if (SECRET_EXCEPTIONS.has(basename)) {
    return false;
  }

  if (basename === '.env' || basename.startsWith('.env.')) {
    return true;
  }

  if (basename.endsWith('.pem')) {
    return true;
  }

  if (basename === 'id_rsa' || basename.startsWith('id_rsa.') || basename === 'id_dsa' || basename === 'id_ed25519') {
    return true;
  }

  if (basename.endsWith('.p12') || basename.endsWith('.keystore')) {
    return true;
  }

  if (basename === 'credentials.json') {
    return true;
  }

  return false;
}

/**
 * hygiene.secrets:
 * 2 if no committed path matches .env, .env.* (except .env.example, .env.sample, .env.template),
 * *.pem, id_rsa, *.p12, *.keystore, credentials.json; else 0.
 * Name-based only; do not claim the repo is secret-free.
 */
export const secretsSignal: Signal = {
  id: 'hygiene.secrets',
  categoryId: 'hygiene',
  label: 'Committed secrets check',
  max: 2,
  compute({ snapshot }: SignalContext): SignalResult {
    const matchingFiles: FileNode[] = [];
    for (const file of snapshot.tree) {
      if (isSecretPath(file.path)) {
        matchingFiles.push(file);
      }
    }

    const hasSecrets = matchingFiles.length > 0;
    const earned = hasSecrets ? 0 : 2;
    const status = hasSecrets ? 'fail' : 'pass';

    return {
      id: 'hygiene.secrets',
      categoryId: 'hygiene',
      label: 'Committed secrets check',
      earned,
      max: 2,
      status,
      evidence: hasSecrets
        ? `Potentially sensitive file(s) found in repository: ${matchingFiles.map((f) => f.path).join(', ')}.`
        : 'No exposed credentials or environment files detected by filename.',
    };
  },
};
