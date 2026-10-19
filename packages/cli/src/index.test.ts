import { describe, expect, it } from 'vitest';
import { createProgram, formatGrade, formatReport } from './index';
import type { AnalysisReport } from '@repometric/core';

describe('cli entry', () => {
  it('creates commander program with correct name and options', () => {
    const program = createProgram();
    expect(program.name()).toBe('repometric');
    const optionNames = program.options.map((o) => o.name());
    expect(optionNames).toContain('json');
    expect(optionNames).toContain('min-score');
    expect(optionNames).toContain('token');
    expect(optionNames).toContain('open');
    expect(optionNames).toContain('no-color');
  });

  it('formats grades correctly into readable labels', () => {
    expect(formatGrade('excellent')).toBe('Excellent');
    expect(formatGrade('good')).toBe('Good');
    expect(formatGrade('needs-work')).toBe('Needs work');
    expect(formatGrade('at-risk')).toBe('At risk');
  });

  it('formats AnalysisReport cleanly matching CLI spec format', () => {
    const mockReport: AnalysisReport = {
      repo: {
        owner: 'expressjs',
        name: 'express',
        description: 'Fast, unopinionated, minimalist web framework for node.',
        stars: 65000,
        archived: false,
        defaultBranch: 'master',
        license: 'MIT',
        homepage: 'https://expressjs.com',
        topics: ['express', 'framework', 'node'],
        hasWiki: true,
      },
      commitSha: 'abcdef123456',
      score: 82,
      grade: 'good',
      categories: [
        {
          id: 'activity',
          label: 'Activity',
          weight: 20,
          earned: 16,
          excluded: false,
          signals: [],
        },
        {
          id: 'documentation',
          label: 'Documentation',
          weight: 20,
          earned: 18,
          excluded: false,
          signals: [],
        },
      ],
      fixes: [
        {
          id: 'ci',
          signalId: 'ci',
          title: 'Add a CI workflow',
          effort: 'S',
          pointsGain: 4.5,
          priority: 4.5,
          why: 'Automated tests prevent regressions.',
          how: 'Add a GitHub Actions workflow in .github/workflows.',
        },
      ],
      projectedScore: 86,
      analyzedAt: new Date().toISOString(),
      coreVersion: '0.1.0',
    };

    const output = formatReport(mockReport, { noColor: true });
    expect(output).toContain('expressjs/express  82/100  Good');
    expect(output).toContain('(projected 86 after fixes)');
    expect(output).toContain('Activity         16/20');
    expect(output).toContain('Documentation    18/20');
    expect(output).toContain('Top fixes');
    expect(output).toContain('+4.5  Add a CI workflow                 (S)');
  });
});
