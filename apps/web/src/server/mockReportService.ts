import type { AnalysisReport, FileNode, GraphData } from '@repometric/core';
import { mockReport, mockFiles, mockGraph } from '@repometric/core';

export interface MockRepoData {
  report: AnalysisReport;
  files: FileNode[];
  graph: GraphData;
}

const PRESET_REPOS: Record<string, { score: number; grade: 'excellent' | 'good' | 'needs-work' | 'at-risk'; projected: number }> = {
  'facebook/react': { score: 68, grade: 'needs-work', projected: 86 },
  'expressjs/express': { score: 82, grade: 'good', projected: 92 },
  'tailwindlabs/tailwindcss': { score: 94, grade: 'excellent', projected: 98 },
  'pallets/flask': { score: 88, grade: 'good', projected: 95 },
  'shadcn-ui/ui': { score: 91, grade: 'excellent', projected: 97 },
  'astral-sh/uv': { score: 96, grade: 'excellent', projected: 100 },
};

export function getMockAnalysis(owner: string, repo: string): MockRepoData {
  const repoKey = `${owner}/${repo}`.toLowerCase();
  const preset = PRESET_REPOS[repoKey];

  // Base clone of mockReport
  const base = JSON.parse(JSON.stringify(mockReport)) as AnalysisReport;
  base.repo.owner = owner;
  base.repo.name = repo;
  base.repo.description = `${owner}/${repo} - Clean, modern repository analyzed with RepoMetric.`;

  if (preset) {
    base.score = preset.score;
    base.grade = preset.grade;
    base.projectedScore = preset.projected;
  } else {
    // Generate deterministic score from string hash
    let hash = 0;
    for (let i = 0; i < repoKey.length; i++) {
      hash = (hash << 5) - hash + repoKey.charCodeAt(i);
      hash |= 0;
    }
    const derivedScore = 65 + (Math.abs(hash) % 30); // 65 - 94
    base.score = derivedScore;
    base.grade = derivedScore >= 90 ? 'excellent' : derivedScore >= 75 ? 'good' : derivedScore >= 55 ? 'needs-work' : 'at-risk';
    base.projectedScore = Math.min(100, derivedScore + 12);
  }

  return {
    report: base,
    files: mockFiles,
    graph: mockGraph,
  };
}
