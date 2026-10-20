'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  FileText,
  Wrench,
  ExternalLink,
  RotateCcw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Compass,
  FileCode,
  Folder,
  AlertTriangle,
} from 'lucide-react';

import type { AnalysisReport, FileNode, GraphData } from '@repometric/core';
import { Header } from '../../../../components/Header';
import { RepoInput } from '../../../../components/RepoInput';
import { ChunkyButton } from '../../../../components/ChunkyButton';
import { StickerBadge } from '../../../../components/StickerBadge';
import { ScoreSummary } from '../../../../components/ScoreSummary';
import { CategoryRow } from '../../../../components/CategoryRow';
import { FixCard } from '../../../../components/FixCard';
import { InsightCard } from '../../../../components/InsightCard';
import { ReadingGuide } from '../../../../components/ReadingGuide';
import { EmptyState, ErrorState } from '../../../../components/EmptyState';
import { AnalysisScreen } from '../../../../components/AnalysisScreen';
import { ShareMenu } from '../../../../components/ShareMenu';
import { CoachMarkTour } from '../../../../components/CoachMarkTour';
import { Toast } from '../../../../components/Toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/Tabs';
import { getMockAnalysis } from '../../../../server/mockReportService';

// Lazy-load Visualizers for visualizer budget
const RepoMap = dynamic(() => import('@repometric/viz').then((mod) => mod.RepoMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-card border-2 border-ink bg-card flex flex-col items-center justify-center text-xs text-ink-muted space-y-2">
      <div className="w-8 h-8 rounded-full border-2 border-ink border-t-primary animate-spin" />
      <span>Loading interactive Repo Map...</span>
    </div>
  ),
});

const DependencyGraph = dynamic(
  () => import('@repometric/viz').then((mod) => mod.DependencyGraph),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] rounded-card border-2 border-ink bg-card flex flex-col items-center justify-center text-xs text-ink-muted space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-ink border-t-primary animate-spin" />
        <span>Loading interactive Dependency Graph...</span>
      </div>
    ),
  },
);

const ArchitectureDiagram = dynamic(
  () => import('@repometric/viz').then((mod) => mod.ArchitectureDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[620px] rounded-card border-2 border-ink bg-card flex flex-col items-center justify-center text-xs text-ink-muted space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-ink border-t-primary animate-spin" />
        <span>Loading interactive Architecture Diagram...</span>
      </div>
    ),
  },
);

type TabType = 'overview' | 'fixes' | 'map' | 'graph' | 'diagram';

interface AnalysisDataState {
  report: AnalysisReport;
  files: FileNode[];
  graph: GraphData | null;
  graphStatus: 'ready' | 'missing' | 'unsupported';
  isMock: boolean;
}

export default function ReportPage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;
  const searchParams = useSearchParams();

  // URL state
  const initialTab = (searchParams.get('tab') as TabType) || 'overview';
  const errorParam = searchParams.get('error');
  const forceTour = searchParams.get('tour') === 'true';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [analyzing, setAnalyzing] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Analysis State
  const [data, setData] = useState<AnalysisDataState | null>(null);
  const [fetchError, setFetchError] = useState<{ code: string; message: string } | null>(null);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [reanalyzeTrigger, setReanalyzeTrigger] = useState(0);

  // Local Mark Done storage state for Fixes
  const [doneFixes, setDoneFixes] = useState<Record<string, boolean>>({});
  const [templateCopied, setTemplateCopied] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Mock fallback generator
  const mockFallback = useMemo(() => getMockAnalysis(owner, repo), [owner, repo]);

  // Active data sources
  const baseReport: AnalysisReport = data?.report ?? mockFallback.report;
  const files: FileNode[] = data?.files ?? mockFallback.files;
  const graph: GraphData = data?.graph ?? mockFallback.graph;
  const isMock = data?.isMock ?? false;

  // Fetch real analysis from API
  useEffect(() => {
    let cancelled = false;
    setAnalyzing(true);
    setAnimationFinished(false);
    setFetchError(null);

    // If explicit ?mock=true is passed, use mock fallback immediately
    if (searchParams.get('mock') === 'true') {
      const mock = getMockAnalysis(owner, repo);
      setData({
        report: mock.report,
        files: mock.files,
        graph: mock.graph,
        graphStatus: 'ready',
        isMock: true,
      });
      return;
    }

    async function loadAnalysis() {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repo: `${owner}/${repo}` }),
        });

        if (cancelled) return;

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const code = errData?.error?.code || 'INTERNAL';
          const message = errData?.error?.message || 'Failed to analyze repository.';
          setFetchError({ code, message });
          setAnalyzing(false);
          return;
        }

        const json = await res.json();
        if (cancelled) return;

        setData({
          report: json.analysis,
          files: json.files || [],
          graph: json.graph?.data || null,
          graphStatus: json.graph?.status || 'ready',
          isMock: false,
        });
      } catch {
        if (cancelled) return;
        // Offline or test environment fallback
        const mock = getMockAnalysis(owner, repo);
        setData({
          report: mock.report,
          files: mock.files,
          graph: mock.graph,
          graphStatus: 'ready',
          isMock: true,
        });
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [owner, repo, searchParams, reanalyzeTrigger]);

  // When data is available and stepper animation has completed, reveal the report
  useEffect(() => {
    if (!analyzing) return;
    if (data && animationFinished) {
      setAnalyzing(false);
      setToastMessage('Found a fresh report!');
    }
  }, [analyzing, data, animationFinished]);

  // Initialize done fixes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`repometric_done_${owner}_${repo}`);
      if (stored) {
        setDoneFixes(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [owner, repo]);

  // Handle URL tab changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabType;
    if (tabFromUrl && ['overview', 'fixes', 'map', 'graph', 'diagram'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Switch tab and sync with URL
  const handleTabChange = useCallback((tab: string) => {
    const nextTab = tab as TabType;
    setActiveTab(nextTab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', nextTab);
    window.history.replaceState(null, '', url.toString());
  }, []);

  // Calculate local points gained and projected score
  const { currentScore, projectedScore, pointsGainedFromDone } = useMemo(() => {
    let gained = 0;
    baseReport.fixes.forEach((fix) => {
      if (doneFixes[fix.id]) {
        gained += fix.pointsGain;
      }
    });
    const calculated = Math.min(100, Math.round(baseReport.score + gained));
    const target = Math.max(calculated, baseReport.projectedScore);
    return {
      currentScore: calculated,
      projectedScore: target,
      pointsGainedFromDone: gained,
    };
  }, [baseReport, doneFixes]);

  const handleToggleDone = (fixId: string, done: boolean) => {
    const updated = { ...doneFixes, [fixId]: done };
    setDoneFixes(updated);
    try {
      localStorage.setItem(`repometric_done_${owner}_${repo}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setToastMessage(done ? 'Marked done! Projected score updated.' : 'Fix unmarked.');
  };

  // Dynamic Repository Insights derived from actual files and graph
  const mostDepended = useMemo(() => {
    if (!graph?.nodes?.length) return null;
    return [...graph.nodes].sort((a, b) => b.fanIn - a.fanIn)[0];
  }, [graph]);

  const cycleCount = graph?.stats?.cycles?.length ?? 0;

  const largestFolder = useMemo(() => {
    if (!files.length) return null;
    const folderSizes = new Map<string, { size: number; count: number }>();
    for (const f of files) {
      const parts = f.path.split('/');
      if (parts.length > 1) {
        const folder = parts.slice(0, -1).join('/') + '/';
        const cur = folderSizes.get(folder) || { size: 0, count: 0 };
        folderSizes.set(folder, { size: cur.size + f.size, count: cur.count + 1 });
      }
    }
    let max: { folder: string; size: number; count: number } | null = null;
    for (const [folder, val] of folderSizes.entries()) {
      if (!max || val.size > max.size) {
        max = { folder, ...val };
      }
    }
    return max;
  }, [files]);

  const testFileCount = useMemo(() => files.filter((f) => f.isTest).length, [files]);
  const sourceFileCount = useMemo(
    () => files.filter((f) => !f.isTest && f.language).length,
    [files],
  );

  // Confetti on 90+ score (never on reduced motion)
  useEffect(() => {
    if (analyzing || errorParam || fetchError) return;
    if (currentScore >= 90) {
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!prefersReduced) {
        try {
          const celebratedKey = `repometric_celebrated_${owner}_${repo}`;
          if (!sessionStorage.getItem(celebratedKey)) {
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#D6F954', '#60A5FA', '#FBBF24', '#F87171', '#34D399'],
            });
            sessionStorage.setItem(celebratedKey, 'true');
          }
        } catch {
          // ignore
        }
      }
    }
  }, [analyzing, errorParam, fetchError, currentScore, owner, repo]);

  const handleCopyTemplate = async (type: 'license' | 'gitignore' | 'ci') => {
    let content = '';
    let name = '';
    if (type === 'license') {
      name = 'MIT License template';
      content = `MIT License\n\nCopyright (c) ${new Date().getFullYear()} ${owner}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy...`;
    } else if (type === 'gitignore') {
      name = '.gitignore template';
      content = `node_modules/\n.env\n.env.local\ndist/\nbuild/\n.DS_Store\ncoverage/`;
    } else {
      name = 'GitHub Actions CI template';
      content = `name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n      - run: npm ci\n      - run: npm test`;
    }

    await navigator.clipboard.writeText(content);
    setTemplateCopied(type);
    setToastMessage(`${name} copied to clipboard!`);
    setTimeout(() => setTemplateCopied(null), 1500);
  };

  const toggleFullscreen = () => {
    const el = document.getElementById('map-container');
    if (!el) return;

    if (!isFullscreen) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Render Empty and Error states per UX_SPEC 2.6
  const activeErrorCode = errorParam || fetchError?.code?.toLowerCase();
  if (activeErrorCode) {
    if (activeErrorCode === 'not_found' || activeErrorCode === 'invalid_repo') {
      return (
        <div className="min-h-screen flex flex-col bg-paper">
          <Header />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
            <EmptyState
              mood="lost"
              title="Couldn't find that repo"
              description={fetchError?.message || "Couldn't find that repo. Check the spelling, and make sure it's public on GitHub."}
              actionText="Try another repo"
              actionHref="/"
            />
          </main>
        </div>
      );
    }

    if (activeErrorCode === 'private' || activeErrorCode === 'private_repo') {
      return (
        <div className="min-h-screen flex flex-col bg-paper">
          <Header />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
            <EmptyState
              mood="neutral"
              title="That repo looks private"
              description="RepoMetric reads public repos only. We never access private code or credentials."
              actionText="Try another repo"
              actionHref="/"
            />
          </main>
        </div>
      );
    }

    if (activeErrorCode === 'rate_limit' || activeErrorCode === 'rate_limited') {
      return (
        <div className="min-h-screen flex flex-col bg-paper">
          <Header />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
            <ErrorState
              mood="worried"
              title="Rate limit reached"
              message={fetchError?.message || "GitHub API rate limit reached. Resets in 14 minutes."}
              solution="Add your optional personal GitHub token to raise your limit to 5,000 requests per hour."
              retryText="Go back home"
              onRetry={() => (window.location.href = '/')}
            />
          </main>
        </div>
      );
    }

    if (activeErrorCode === 'too_large') {
      return (
        <div className="min-h-screen flex flex-col bg-paper">
          <Header />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
            <EmptyState
              mood="neutral"
              title="Repository too large for graph"
              description="This repo is too big for the dependency graph, but the score and map still work."
              actionText="View Repo Map"
              onAction={() => handleTabChange('map')}
            />
          </main>
        </div>
      );
    }

    if (activeErrorCode === 'unsupported_language') {
      return (
        <div className="min-h-screen flex flex-col bg-paper">
          <Header />
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
            <EmptyState
              mood="neutral"
              title="Unsupported language for graph"
              description="The dependency graph currently supports JavaScript, TypeScript, and Python. The Repo Map and health score work for all languages."
              actionText="View Repo Map"
              onAction={() => handleTabChange('map')}
            />
          </main>
        </div>
      );
    }

    // Generic error
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex items-center justify-center">
          <ErrorState
            mood="worried"
            title="Analysis failed"
            message={fetchError?.message || "An unexpected error occurred while analyzing this repository."}
            solution="Check that the repository exists and is accessible, then try again."
            retryText="Try again"
            onRetry={() => setReanalyzeTrigger((c) => c + 1)}
          />
        </main>
      </div>
    );
  }

  // 1. Analysis Screen during initial scan
  if (analyzing) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header statusText={`Analyzing ${owner}/${repo}...`} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 flex items-center justify-center">
          <AnalysisScreen
            repoName={`${owner}/${repo}`}
            onComplete={() => {
              setAnimationFinished(true);
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper selection:bg-lime selection:text-ink">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          duration={3000}
        />
      )}

      {/* First-Run Coach-Mark Tour */}
      <CoachMarkTour
        forceOpen={forceTour || showTour}
        onComplete={() => setShowTour(false)}
      />

      <Header>
        <RepoInput defaultValue={`${owner}/${repo}`} showChips={false} compact />
      </Header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* 2. Header Strip */}
        <div className="rounded-card border-2 border-ink bg-card bg-paper-dots p-4 shadow-[4px_4px_0_var(--ink)] flex flex-wrap items-center justify-between gap-4">
          {/* Left: owner/repo & short sha */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://github.com/${owner}/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 font-mono text-base sm:text-lg font-bold text-ink hover:text-primary-text transition-colors"
            >
              <span>{owner}/{repo}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted bg-paper-2 px-2.5 py-1 rounded-control border-2 border-ink shadow-[1px_1px_0_var(--ink)]">
              <span>sha: {baseReport.commitSha.slice(0, 7)}</span>
              {isMock && (
                <StickerBadge variant="card" size="sm" rotate="none">
                  sample
                </StickerBadge>
              )}
            </div>
          </div>

          {/* Right: Actions (Tour, Re-analyze, Share) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ChunkyButton
              variant="secondary"
              size="sm"
              onClick={() => setShowTour(true)}
              className="flex items-center space-x-1"
              title="Take a quick tour"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tour</span>
            </ChunkyButton>

            <ChunkyButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setReanalyzeTrigger((c) => c + 1);
              }}
              className="flex items-center space-x-1"
              title="Re-run analysis"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Re-analyze</span>
            </ChunkyButton>

            <ShareMenu
              report={{ ...baseReport, score: currentScore, projectedScore }}
              onToast={(msg) => setToastMessage(msg)}
            />
          </div>
        </div>

        {/* 3. Summary Card with score count-up, grade, verdict & projected bar */}
        <div id="tour-score">
          <ScoreSummary
            score={currentScore}
            projectedScore={projectedScore}
            className="w-full"
          />
        </div>

        {/* 4. Tabs: Overview, Fixes, Map, Graph, Diagram */}
        <div className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-4"
          >
            <div className="border-b-2 border-ink pb-2 flex items-center justify-between overflow-x-auto no-scrollbar">
              <TabsList className="flex items-center space-x-1.5 bg-paper-2 p-1 rounded-control border-2 border-ink shadow-[2px_2px_0_var(--ink)]">
                <TabsTrigger value="overview" className="flex items-center space-x-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>

                <TabsTrigger
                  id="tour-fixes"
                  value="fixes"
                  className="flex items-center space-x-1.5"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Fixes ({baseReport.fixes.length})</span>
                  {pointsGainedFromDone > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-lime text-ink rounded-pill text-[10px] font-bold">
                      +{pointsGainedFromDone.toFixed(1)}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  id="tour-map"
                  value="map"
                  className="flex items-center space-x-1.5"
                >
                  <span>Map</span>
                </TabsTrigger>

                <TabsTrigger value="graph" className="flex items-center space-x-1.5">
                  <span>Graph</span>
                </TabsTrigger>

                <TabsTrigger value="diagram" className="flex items-center space-x-1.5">
                  <span>Diagram</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* 6 Category Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-lg text-ink">
                    Health categories
                  </h3>
                  <span className="text-xs text-ink-muted">
                    Weighted across 6 software engineering dimensions
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {baseReport.categories.map((cat) => (
                    <CategoryRow key={cat.id} category={cat} />
                  ))}
                </div>
              </div>

              {/* Top 3 Fixes Preview */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-ink">
                      Top payoff fixes
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Highest points gained for the least engineering effort.
                    </p>
                  </div>

                  <ChunkyButton
                    variant="lime"
                    size="sm"
                    onClick={() => handleTabChange('fixes')}
                  >
                    View all {baseReport.fixes.length} fixes
                  </ChunkyButton>
                </div>

                <div className="space-y-2.5">
                  {baseReport.fixes.slice(0, 3).map((fix) => (
                    <FixCard
                      key={fix.id}
                      fix={fix}
                      isDone={!!doneFixes[fix.id]}
                      onToggleDone={handleToggleDone}
                    />
                  ))}
                </div>
              </div>

              {/* Insights Strip of InsightCards */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-ink">
                    Repository insights
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Structural highlights derived from repository tree and dependency graph.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InsightCard
                    variant="sky"
                    label="Most depended-on file"
                    value={mostDepended ? (mostDepended.id.split('/').pop() || mostDepended.id) : 'None'}
                    subtext={
                      mostDepended
                        ? `Imported by ${mostDepended.fanIn} modules (${mostDepended.id})`
                        : 'No internal dependencies detected'
                    }
                    badge={mostDepended && mostDepended.fanIn > 5 ? 'Hotspot' : 'Normal'}
                    icon={<FileCode className="w-4 h-4 text-primary-text" />}
                  />
                  <InsightCard
                    variant={cycleCount === 0 ? 'lime' : 'coral'}
                    label="Circular dependencies"
                    value={`${cycleCount} cycle${cycleCount === 1 ? '' : 's'}`}
                    subtext={cycleCount === 0 ? 'Clean acyclic import tree' : 'Mutual import loops detected'}
                    badge={cycleCount === 0 ? 'Clean' : 'Needs attention'}
                    icon={cycleCount === 0 ? <Check className="w-4 h-4 text-ink" /> : <AlertTriangle className="w-4 h-4 text-coral-text" />}
                  />
                  <InsightCard
                    variant="sun"
                    label="Largest folder"
                    value={largestFolder ? largestFolder.folder : 'Root'}
                    subtext={
                      largestFolder
                        ? `${Math.max(1, Math.round(largestFolder.size / 1024))} KB across ${largestFolder.count} files`
                        : 'Single directory project'
                    }
                    badge="Storage"
                    icon={<Folder className="w-4 h-4 text-ink" />}
                  />
                  <InsightCard
                    variant={testFileCount > 0 ? 'sky' : 'coral'}
                    label="Test coverage"
                    value={testFileCount > 0 ? `${testFileCount} test files` : 'No tests found'}
                    subtext={
                      testFileCount > 0
                        ? `Found alongside ${sourceFileCount} source files`
                        : 'No test files detected in repository tree'
                    }
                    badge={testFileCount > 0 ? 'Protected' : 'Quick win'}
                    icon={testFileCount > 0 ? <Check className="w-4 h-4 text-primary-text" /> : <AlertTriangle className="w-4 h-4 text-coral-text" />}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: FIXES */}
            <TabsContent value="fixes" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-ink">
                    Prioritized fix list
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Ranked by points gained divided by estimated engineering effort.
                  </p>
                </div>
              </div>

              {/* Template Copy Quick-Actions */}
              <div className="rounded-card border-2 border-ink bg-card p-3 shadow-[2px_2px_0_var(--ink)] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-ink">
                  ⚡ Quick starter templates:
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleCopyTemplate('license')}
                    className="px-2.5 py-1 rounded-control border-2 border-ink bg-card hover:bg-paper-2 text-xs font-bold text-ink flex items-center space-x-1 shadow-[2px_2px_0_var(--ink)]"
                  >
                    {templateCopied === 'license' ? <Check className="w-3 h-3 text-lime-text" /> : <Copy className="w-3 h-3" />}
                    <span>LICENSE</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyTemplate('gitignore')}
                    className="px-2.5 py-1 rounded-control border-2 border-ink bg-card hover:bg-paper-2 text-xs font-bold text-ink flex items-center space-x-1 shadow-[2px_2px_0_var(--ink)]"
                  >
                    {templateCopied === 'gitignore' ? <Check className="w-3 h-3 text-lime-text" /> : <Copy className="w-3 h-3" />}
                    <span>.gitignore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyTemplate('ci')}
                    className="px-2.5 py-1 rounded-control border-2 border-ink bg-card hover:bg-paper-2 text-xs font-bold text-ink flex items-center space-x-1 shadow-[2px_2px_0_var(--ink)]"
                  >
                    {templateCopied === 'ci' ? <Check className="w-3 h-3 text-lime-text" /> : <Copy className="w-3 h-3" />}
                    <span>CI workflow</span>
                  </button>
                </div>
              </div>

              {/* Fix Cards List */}
              <div className="space-y-3">
                {baseReport.fixes.map((fix) => (
                  <FixCard
                    key={fix.id}
                    fix={fix}
                    isDone={!!doneFixes[fix.id]}
                    onToggleDone={handleToggleDone}
                  />
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: REPO MAP */}
            <TabsContent value="map" className="mt-0 space-y-4">
              <ReadingGuide type="map" />

              <div
                id="map-container"
                className="relative rounded-card border-2 border-ink bg-card p-4 shadow-[4px_4px_0_var(--ink)] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b-2 border-ink">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Treemap zoom
                    </span>
                    <StickerBadge variant="sky" size="sm" rotate="none">
                      {files.length} files mapped
                    </StickerBadge>
                  </div>

                  <ChunkyButton
                    variant="secondary"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="flex items-center space-x-1"
                    title={isFullscreen ? 'Exit full screen' : 'View full screen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
                  </ChunkyButton>
                </div>

                <div className="w-full">
                  <RepoMap
                    files={files}
                    height={560}
                    selectedPath={selectedPath ?? undefined}
                    onSelect={(p) => setSelectedPath(p)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: GRAPH */}
            <TabsContent value="graph" className="mt-0 space-y-4">
              <ReadingGuide type="graph" />

              <div
                id="graph-container"
                className="relative rounded-card border-2 border-ink bg-card p-4 shadow-[4px_4px_0_var(--ink)] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-ink">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Force-directed graph
                    </span>
                    {graph && graph.nodes && graph.nodes.length > 0 && (
                      <>
                        <StickerBadge variant="sky" size="sm" rotate="none">
                          {graph.nodes.length} nodes • {graph.edges.length} imports
                        </StickerBadge>
                        {cycleCount > 0 && (
                          <StickerBadge variant="coral" size="sm" rotate="none">
                            {cycleCount} cycle{cycleCount === 1 ? '' : 's'} detected
                          </StickerBadge>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full">
                  {graph && graph.nodes && graph.nodes.length > 0 ? (
                    <DependencyGraph
                      data={graph}
                      height={580}
                      onSelectNode={(nodeId) => setSelectedPath(nodeId)}
                    />
                  ) : (
                    <div className="py-12">
                      <EmptyState
                        mood="neutral"
                        title="Graph unsupported for this repo"
                        description="The dependency graph currently supports JavaScript, TypeScript, and Python projects with under 20,000 files. The Repo Map and health score work for all languages."
                        actionText="View Repo Map"
                        onAction={() => handleTabChange('map')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: DIAGRAM */}
            <TabsContent value="diagram" className="mt-0 space-y-4">
              <ReadingGuide type="diagram" />

              <div
                id="diagram-container"
                className="relative rounded-card border-2 border-ink bg-card p-4 shadow-[4px_4px_0_var(--ink)] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-ink">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                      Architecture Layers
                    </span>
                    <StickerBadge variant="lime" size="sm" rotate="none">
                      Deterministic flowchart
                    </StickerBadge>
                  </div>
                </div>

                <div className="w-full">
                  {graph && graph.nodes && graph.nodes.length > 0 ? (
                    <ArchitectureDiagram
                      files={files}
                      graph={graph}
                      owner={owner}
                      repo={repo}
                      sha={baseReport.commitSha}
                      height={620}
                      onSelectPath={(path) => setSelectedPath(path)}
                    />
                  ) : (
                    <div className="py-12">
                      <EmptyState
                        mood="neutral"
                        title="Architecture diagram unavailable"
                        description="The architecture diagram is built from dependency graph relationships. For repositories without supported import trees, explore the interactive Repo Map instead."
                        actionText="View Repo Map"
                        onAction={() => handleTabChange('map')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
