import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '../../types';
import {
  analyzeReadme,
  calculateCommentDensity,
  commentsSignal,
  docsFolderSignal,
  isRootReadme,
  metadataSignal,
  readmeExistsSignal,
  readmeSectionsSignal,
} from './documentation';

function createMockSnapshot(overrides: Partial<RepoSnapshot> = {}): RepoSnapshot {
  return {
    meta: {
      owner: 'testowner',
      name: 'testrepo',
      defaultBranch: 'main',
      description: 'A great open source repository analyzer tool.',
      topics: ['typescript', 'analyzer', 'metrics'],
      homepage: 'https://repometric.dev',
      license: 'MIT',
      stars: 100,
      hasWiki: false,
      archived: false,
    },
    commitSha: 'abc1234',
    now: '2026-03-01T12:00:00Z',
    tree: [
      { path: 'README.md', size: 1000, language: 'Markdown', isTest: false },
      { path: 'src/index.ts', size: 500, language: 'TypeScript', isTest: false },
      { path: 'docs/guide.md', size: 500, language: 'Markdown', isTest: false },
    ],
    readme: '# Test Repo\n\nIntro paragraph here...',
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

describe('Documentation Signals', () => {
  describe('docs.readme_exists', () => {
    it('returns 3 points when README.md is in tree root', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'README.md', size: 100, language: 'Markdown', isTest: false }],
        readme: null,
      });
      const res = readmeExistsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('returns 3 points for case variations and extensions (readme.txt, README.rst, README)', () => {
      expect(isRootReadme('readme.txt')).toBe(true);
      expect(isRootReadme('README.rst')).toBe(true);
      expect(isRootReadme('README')).toBe(true);
      expect(isRootReadme('readme.markdown')).toBe(true);
      expect(isRootReadme('docs/README.md')).toBe(false);

      const snapshot = createMockSnapshot({
        tree: [{ path: 'README', size: 100, language: null, isTest: false }],
        readme: null,
      });
      const res = readmeExistsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('returns 3 points when snapshot.readme has content even if tree does not list it', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'src/index.ts', size: 100, language: 'TypeScript', isTest: false }],
        readme: '# Readme Content',
      });
      const res = readmeExistsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('returns 0 points when README is in subdirectory only or completely missing', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'docs/README.md', size: 100, language: 'Markdown', isTest: false }],
        readme: null,
      });
      const res = readmeExistsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('docs.readme_sections', () => {
    it('returns 0 if readme is null or empty', () => {
      const snapshot = createMockSnapshot({ readme: null });
      const res = readmeSectionsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('caps score at 2 when README is under 300 characters even if all sections present', () => {
      // 5 sections condensed into < 300 chars
      const shortReadme = `# Short
RepoMetric is an advanced developer tool providing automated health metrics and architecture visualizers for public code repositories with instant actionable insights.
## Install
\`\`\`bash
npm i repometric
\`\`\`
## Usage
\`\`\`bash
repometric analyze
\`\`\`
![demo](demo.png)
## License
MIT`;
      expect(shortReadme.length).toBeLessThan(300);

      const snapshot = createMockSnapshot({ readme: shortReadme });
      const res = readmeSectionsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('partial');
      expect(res.evidence).toContain('under 300 characters');
    });

    it('earns all 8 points for a comprehensive README over 300 characters', () => {
      const fullReadme = `# RepoMetric

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

RepoMetric is an advanced deterministic repository analysis and visualization suite built to inspect codebase health, measure engineering hygiene, track dependency freshness, and generate interactive architecture visualizers for developers.

## Installation and Quick Start

You can easily get started by installing the package via your favorite package manager:

\`\`\`bash
npm install @repometric/cli
\`\`\`

## Usage and Examples

Run the analyzer in your terminal or point it to any public GitHub repository:

\`\`\`typescript
import { scoreSnapshot } from '@repometric/core';
const report = scoreSnapshot(snapshot);
console.log('Repo grade:', report.grade);
\`\`\`

## Architecture & Visuals

Here is an architectural map of how dependencies interact:
![Repo Map](https://repometric.dev/assets/repomap.png)

## License

This software is released under the permissive MIT License. See LICENSE for more details.
`;
      expect(fullReadme.length).toBeGreaterThanOrEqual(300);

      const snapshot = createMockSnapshot({ readme: fullReadme });
      const res = readmeSectionsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(8);
      expect(res.status).toBe('pass');
    });

    it('detects install and usage from code fences when headings are non-standard', () => {
      const codeFenceReadme = `# Awesome Lib

Awesome Lib is a modern lightweight toolkit designed for high performance web scraping and parsing with extensive support for async pipelines and deterministic memory footprints.

Here is how you download and install the package from npm or pnpm:

\`\`\`bash
pnpm add awesome-lib
\`\`\`

And here is some sample code showing how to use the main API:

\`\`\`typescript
const client = new AwesomeLib();
await client.run();
\`\`\`

Check out the homepage at https://example.com for more info.
[![License](https://img.shields.io/badge/license-Apache-blue.svg)](LICENSE)
`;
      expect(codeFenceReadme.length).toBeGreaterThan(300);

      const analysis = analyzeReadme(codeFenceReadme, 'https://example.com');
      expect(analysis.hasTitleIntro).toBe(true);
      expect(analysis.hasInstall).toBe(true);
      expect(analysis.hasUsage).toBe(true);
      expect(analysis.hasVisuals).toBe(true);
      expect(analysis.hasLicense).toBe(true);

      const snapshot = createMockSnapshot({ readme: codeFenceReadme });
      const res = readmeSectionsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(8);
      expect(res.status).toBe('pass');
    });

    it('evaluates partial sections when some are missing', () => {
      // Intro < 20 words, no license, but has install and usage headings and visual link
      const partialReadme = `# Short Title

A simple library.

## Getting Started

\`\`\`bash
npm i foo
\`\`\`

## How to use

Run the app.

<img src="https://example.com/screenshot.png" alt="Screenshot" />

This text is padded to ensure that the character count is safely above three hundred characters so that the under three hundred character cap is not triggered during this unit test execution.
`;
      expect(partialReadme.length).toBeGreaterThan(300);

      const snapshot = createMockSnapshot({
        readme: partialReadme,
        meta: { ...createMockSnapshot().meta, homepage: null },
      });
      const res = readmeSectionsSignal.compute({ snapshot, now: new Date(snapshot.now) });

      // Missing intro (has < 20 words) and license
      // Earned: install (2) + usage (2) + visuals (1) = 5
      expect(res.earned).toBe(5);
      expect(res.status).toBe('partial');
    });
  });

  describe('docs.metadata', () => {
    it('returns 3 points when description is set and topics count >= 3', () => {
      const snapshot = createMockSnapshot({
        meta: {
          ...createMockSnapshot().meta,
          description: 'A tool for measuring repository metrics.',
          topics: ['code-quality', 'typescript', 'cli', 'visualizer'],
        },
      });
      const res = metadataSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('returns 2 points when description is set but topics count < 3', () => {
      const snapshot = createMockSnapshot({
        meta: {
          ...createMockSnapshot().meta,
          description: 'A tool for measuring repository metrics.',
          topics: ['typescript', 'cli'],
        },
      });
      const res = metadataSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(2);
      expect(res.status).toBe('partial');
    });

    it('returns 1 point when description is empty/null but topics count >= 3', () => {
      const snapshot = createMockSnapshot({
        meta: {
          ...createMockSnapshot().meta,
          description: '',
          topics: ['tag1', 'tag2', 'tag3'],
        },
      });
      const res = metadataSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(1);
      expect(res.status).toBe('partial');
    });

    it('returns 0 points when description is empty and topics count < 3', () => {
      const snapshot = createMockSnapshot({
        meta: {
          ...createMockSnapshot().meta,
          description: null,
          topics: [],
        },
      });
      const res = metadataSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('docs.folder', () => {
    it('returns 3 points when docs/ folder exists with at least one file', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'docs/index.md', size: 100, language: 'Markdown', isTest: false }],
        meta: { ...createMockSnapshot().meta, homepage: null },
      });
      const res = docsFolderSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('returns 3 points when homepage URL is set even without docs/ folder', () => {
      const snapshot = createMockSnapshot({
        tree: [{ path: 'src/main.ts', size: 100, language: 'TypeScript', isTest: false }],
        meta: { ...createMockSnapshot().meta, homepage: 'https://docs.repometric.dev' },
      });
      const res = docsFolderSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('returns 0 points when neither docs/ folder nor homepage is set', () => {
      const snapshot = createMockSnapshot({
        tree: [
          { path: 'documentation/index.md', size: 100, language: 'Markdown', isTest: false },
          { path: 'src/index.ts', size: 100, language: 'TypeScript', isTest: false },
        ],
        meta: { ...createMockSnapshot().meta, homepage: null },
      });
      const res = docsFolderSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });
  });

  describe('docs.comments', () => {
    it('returns na when sampledSources is empty or not provided', () => {
      const snapshot = createMockSnapshot({ sampledSources: [] });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('na');
      expect(res.evidence).toContain('No source files available');
    });

    it('returns na when sampledSources have only blank lines', () => {
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/empty.ts', content: '\n\n   \n' }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('na');
    });

    it('correctly calculates comment density for line comments, multi-line blocks, and python docstrings', () => {
      const jsContent = `
// Single line comment
const a = 1;
/*
 * Multi-line comment block
 */
const b = 2;
`;
      const res = calculateCommentDensity([{ path: 'src/file.ts', content: jsContent }]);
      // Lines:
      // // Single line comment (comment 1)
      // const a = 1; (code)
      // /* (comment 2)
      //  * Multi-line comment block (comment 3)
      //  */ (comment 4)
      // const b = 2; (code)
      // Total non-blank = 6, comments = 4
      expect(res.nonBlankLines).toBe(6);
      expect(res.commentLines).toBe(4);
    });

    it('evaluates boundary 0%: 0 points, fail', () => {
      // 10 lines of code, 0 comments -> 0%
      const content = Array(10).fill('const x = 1;').join('\n');
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/main.ts', content }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('evaluates boundary 1.9% (< 2%): 0 points, fail', () => {
      // 1 comment line out of 100 non-blank lines = 1.0%
      const content = '// Comment\n' + Array(99).fill('const x = 1;').join('\n');
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/main.ts', content }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(0);
      expect(res.status).toBe('fail');
    });

    it('evaluates boundary 2.0% (0.02 <= d < 0.05): 1.5 points, partial', () => {
      // 2 comments out of 100 non-blank lines = 2.0%
      const content = '// Comment 1\n// Comment 2\n' + Array(98).fill('const x = 1;').join('\n');
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/main.ts', content }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(1.5);
      expect(res.status).toBe('partial');
    });

    it('evaluates boundary 4.9% (0.02 <= d < 0.05): 1.5 points, partial', () => {
      // 4 comments out of 100 non-blank lines = 4.0%
      const content = '// C1\n// C2\n// C3\n// C4\n' + Array(96).fill('const x = 1;').join('\n');
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/main.ts', content }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(1.5);
      expect(res.status).toBe('partial');
    });

    it('evaluates boundary 5.0% (0.05 <= d <= 0.35): 3 points, pass', () => {
      // 5 comments out of 100 non-blank lines = 5.0%
      const content =
        Array(5).fill('// C').join('\n') + '\n' + Array(95).fill('const x = 1;').join('\n');
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/main.ts', content }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('evaluates optimal 20% (0.05 <= d <= 0.35): 3 points, pass', () => {
      // 20 comments out of 100 lines = 20.0%
      const content =
        Array(20).fill('// C').join('\n') + '\n' + Array(80).fill('const x = 1;').join('\n');
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/main.ts', content }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('evaluates boundary 35.0% (0.05 <= d <= 0.35): 3 points, pass', () => {
      // 35 comments out of 100 lines = 35.0%
      const content =
        Array(35).fill('// C').join('\n') + '\n' + Array(65).fill('const x = 1;').join('\n');
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/main.ts', content }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(3);
      expect(res.status).toBe('pass');
    });

    it('evaluates boundary 35.1%+ (d > 0.35): 1.5 points, partial', () => {
      // 36 comments out of 100 lines = 36.0%
      const content =
        Array(36).fill('// C').join('\n') + '\n' + Array(64).fill('const x = 1;').join('\n');
      const snapshot = createMockSnapshot({
        sampledSources: [{ path: 'src/main.ts', content }],
      });
      const res = commentsSignal.compute({ snapshot, now: new Date(snapshot.now) });
      expect(res.earned).toBe(1.5);
      expect(res.status).toBe('partial');
    });
  });
});
