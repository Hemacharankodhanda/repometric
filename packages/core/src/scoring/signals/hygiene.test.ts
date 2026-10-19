import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '../../types';
import {
  ciSignal,
  gitignoreSignal,
  isCiConfigPath,
  isLintFormatPath,
  isRootLicense,
  isSecretPath,
  isTestFilePath,
  licenseSignal,
  lintFormatSignal,
  secretsSignal,
  testsSignal,
} from './hygiene';

function createMockSnapshot(overrides: Partial<RepoSnapshot> = {}): RepoSnapshot {
  return {
    meta: {
      owner: 'testowner',
      name: 'testrepo',
      defaultBranch: 'main',
      description: 'Test repository',
      topics: ['testing'],
      homepage: null,
      license: 'MIT',
      stars: 50,
      hasWiki: false,
      archived: false,
    },
    commitSha: 'commit123',
    now: '2026-03-01T12:00:00Z',
    tree: [],
    readme: null,
    commits: [],
    issues: [],
    pulls: [],
    releases: [],
    sampledSources: [],
    manifests: [],
    registry: {},
    ...overrides,
  };
}

describe('Hygiene Signals', () => {
  describe('hygiene.tests', () => {
    it('recognizes test file path conventions', () => {
      expect(isTestFilePath('tests/test_api.py')).toBe(true);
      expect(isTestFilePath('__tests__/index.test.ts')).toBe(true);
      expect(isTestFilePath('src/app.spec.js')).toBe(true);
      expect(isTestFilePath('pkg/calc_test.go')).toBe(true);
      expect(isTestFilePath('test/unit/user_test.rs')).toBe(true);
      expect(isTestFilePath('spec/models/user_spec.rb')).toBe(true);
      expect(isTestFilePath('src/normal.ts')).toBe(false);
    });

    it('returns 0 when 0 test files exist', () => {
      const snapshot = createMockSnapshot({
        tree: [
          { path: 'src/index.ts', size: 100, language: 'TypeScript', isTest: false },
          { path: 'src/utils.ts', size: 200, language: 'TypeScript', isTest: false },
        ],
      });
      const res = testsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('returns 2 points when 1-2 test files exist', () => {
      const snapshot1 = createMockSnapshot({
        tree: [
          { path: 'src/index.test.ts', size: 100, language: 'TypeScript', isTest: true },
        ],
      });
      const res1 = testsSignal.compute({ snapshot: snapshot1, now: new Date(snapshot1.now) });
      expect(res1.earned).toBe(2);
      expect(res1.status).toBe('partial');

      const snapshot2 = createMockSnapshot({
        tree: [
          { path: 'src/index.test.ts', size: 100, language: 'TypeScript', isTest: true },
          { path: 'tests/unit.py', size: 100, language: 'Python', isTest: true },
        ],
      });
      const res2 = testsSignal.compute({ snapshot: snapshot2, now: new Date(snapshot2.now) });
      expect(res2.earned).toBe(2);
      expect(res2.status).toBe('partial');
    });

    it('returns 4 points when 3 or more test files exist', () => {
      const snapshot = createMockSnapshot({
        tree: [
          { path: 'src/index.test.ts', size: 100, language: 'TypeScript', isTest: true },
          { path: 'src/utils.test.ts', size: 100, language: 'TypeScript', isTest: true },
          { path: 'src/service.spec.ts', size: 100, language: 'TypeScript', isTest: true },
        ],
      });
      const res = testsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(4);
      expect(res.status).toBe('pass');
    });
  });

  describe('hygiene.ci', () => {
    it('detects GitHub Actions, GitLab CI, CircleCI, Azure Pipelines, Jenkinsfile', () => {
      expect(isCiConfigPath('.github/workflows/ci.yml')).toBe(true);
      expect(isCiConfigPath('.github/workflows/test.yaml')).toBe(true);
      expect(isCiConfigPath('.gitlab-ci.yml')).toBe(true);
      expect(isCiConfigPath('.circleci/config.yml')).toBe(true);
      expect(isCiConfigPath('azure-pipelines.yml')).toBe(true);
      expect(isCiConfigPath('Jenkinsfile')).toBe(true);
      expect(isCiConfigPath('ci/script.sh')).toBe(false);
    });

    it('returns 4 points if CI config is in tree', () => {
      const snapshot = createMockSnapshot({
        tree: [
          { path: '.github/workflows/ci.yml', size: 200, language: 'YAML', isTest: false },
        ],
      });
      const res = ciSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(4);
      expect(res.status).toBe('pass');
    });

    it('returns 0 points if no CI config is found', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'src/index.ts', size: 100, language: 'TypeScript', isTest: false }],
      });
      const res = ciSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('hygiene.lint_format', () => {
    it('detects ESLint, Prettier, Biome, EditorConfig, and Python linter configs', () => {
      expect(isLintFormatPath('.eslintrc.json')).toBe(true);
      expect(isLintFormatPath('eslint.config.js')).toBe(true);
      expect(isLintFormatPath('.prettierrc')).toBe(true);
      expect(isLintFormatPath('prettier.config.mjs')).toBe(true);
      expect(isLintFormatPath('biome.json')).toBe(true);
      expect(isLintFormatPath('.editorconfig')).toBe(true);
      expect(isLintFormatPath('ruff.toml')).toBe(true);
      expect(isLintFormatPath('.flake8')).toBe(true);
      expect(isLintFormatPath('tsconfig.json')).toBe(false);
    });

    it('returns 2 points when a linter or formatter file is present in tree', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: '.eslintrc.json', size: 100, language: 'JSON', isTest: false }],
      });
      const res = lintFormatSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('pass');
    });

    it('detects [tool.ruff] or [tool.black] in pyproject.toml', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'pyproject.toml', size: 200, language: null, isTest: false }],
        sampledSources: [
          {
            path: 'pyproject.toml',
            content: `
[project]
name = "demo"

[tool.ruff]
line-length = 88
            `,
          },
        ],
      });
      const res = lintFormatSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('pass');
    });

    it('returns 0 points when no linter or formatter configuration exists', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'src/main.py', size: 50, language: 'Python', isTest: false }],
      });
      const res = lintFormatSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('hygiene.gitignore', () => {
    it('returns 1 point when .gitignore is at root', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: '.gitignore', size: 50, language: null, isTest: false }],
      });
      const res = gitignoreSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(1);
      expect(res.status).toBe('pass');
    });

    it('returns 0 points when .gitignore is not at root', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'packages/cli/.gitignore', size: 50, language: null, isTest: false }],
      });
      const res = gitignoreSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('hygiene.license', () => {
    it('recognizes root license files', () => {
      expect(isRootLicense('LICENSE')).toBe(true);
      expect(isRootLicense('LICENSE.md')).toBe(true);
      expect(isRootLicense('LICENSE.txt')).toBe(true);
      expect(isRootLicense('COPYING')).toBe(true);
      expect(isRootLicense('COPYING.LESSER')).toBe(true);
      expect(isRootLicense('docs/LICENSE')).toBe(false);
    });

    it('returns 2 points when LICENSE is at root', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'LICENSE', size: 1000, language: null, isTest: false }],
        meta: { ...createMockSnapshot().meta, license: null },
      });
      const res = licenseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('pass');
    });

    it('returns 2 points when meta.license is set even without root file', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'src/main.ts', size: 100, language: 'TypeScript', isTest: false }],
        meta: { ...createMockSnapshot().meta, license: 'Apache-2.0' },
      });
      const res = licenseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('pass');
    });

    it('returns 0 points when neither license file nor meta.license exists', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'src/main.ts', size: 100, language: 'TypeScript', isTest: false }],
        meta: { ...createMockSnapshot().meta, license: null },
      });
      const res = licenseSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('hygiene.secrets', () => {
    it('returns 2 points when repo is clean of secrets', () => {
      const snapshot = createMockSnapshot({
        tree: [
          { path: 'src/index.ts', size: 100, language: 'TypeScript', isTest: false },
          { path: 'package.json', size: 100, language: 'JSON', isTest: false },
        ],
      });
      const res = secretsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('pass');
    });

    it('allows .env.example, .env.sample, and .env.template exceptions', () => {
      expect(isSecretPath('.env.example')).toBe(false);
      expect(isSecretPath('config/.env.example')).toBe(false);
      expect(isSecretPath('.env.sample')).toBe(false);
      expect(isSecretPath('apps/web/.env.template')).toBe(false);

      const snapshot = createMockSnapshot({
        tree: [
          { path: '.env.example', size: 100, language: null, isTest: false },
          { path: 'apps/web/.env.template', size: 100, language: null, isTest: false },
          { path: 'services/.env.sample', size: 100, language: null, isTest: false },
        ],
      });
      const res = secretsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('pass');
    });

    it('flags .env and environment variants (.env.local, .env.production, etc.)', () => {
      expect(isSecretPath('.env')).toBe(true);
      expect(isSecretPath('sub/.env')).toBe(true);
      expect(isSecretPath('.env.local')).toBe(true);
      expect(isSecretPath('.env.production')).toBe(true);
      expect(isSecretPath('.env.test')).toBe(true);
      expect(isSecretPath('.env.development.local')).toBe(true);

      const snapshot = createMockSnapshot({
        tree: [{ path: '.env.local', size: 50, language: null, isTest: false }],
      });
      const res = secretsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('flags *.pem, id_rsa, *.p12, *.keystore, credentials.json', () => {
      expect(isSecretPath('certs/cert.pem')).toBe(true);
      expect(isSecretPath('id_rsa')).toBe(true);
      expect(isSecretPath('keys/id_rsa.pub')).toBe(true);
      expect(isSecretPath('secret.p12')).toBe(true);
      expect(isSecretPath('android/release.keystore')).toBe(true);
      expect(isSecretPath('credentials.json')).toBe(true);
      expect(isSecretPath('auth/credentials.json')).toBe(true);

      const snapshot = createMockSnapshot({
        tree: [
          { path: 'ssl/server.pem', size: 200, language: null, isTest: false },
          { path: 'credentials.json', size: 300, language: 'JSON', isTest: false },
        ],
      });
      const res = secretsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
      expect(res.evidence).toContain('ssl/server.pem');
      expect(res.evidence).toContain('credentials.json');
    });
  });
});
