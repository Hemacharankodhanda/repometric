'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Network,
  Map as MapIcon,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Loader2,
  Layers,
} from 'lucide-react';
import type { AnalysisReport, FileNode, GraphData } from '@repometric/core';
import { Header } from '../../../../components/Header';
import { RepoInput } from '../../../../components/RepoInput';
import { ScoreRail } from '../../../../components/ScoreRail';
import { CategoryRow } from '../../../../components/CategoryRow';
import { FixItem } from '../../../../components/FixItem';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/Tabs';
import { Button } from '../../../../components/ui/Button';

// Lazy-load RepoMap and DependencyGraph for visualizer budget
const RepoMap = dynamic(() => import('@repometric/viz').then((mod) => mod.RepoMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] rounded-panel border border-line bg-surface/50 animate-pulse flex items-center justify-center text-xs text-ink-muted">
      Loading interactive map...
    </div>
  ),
});

const DependencyGraph = dynamic(
  () => import('@repometric/viz').then((mod) => mod.DependencyGraph),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] rounded-panel border border-line bg-surface/50 animate-pulse flex items-center justify-center text-xs text-ink-muted">
        Loading interactive dependency graph...
      </div>
    ),
  },
);

const ArchitectureDiagram = dynamic(
  () => import('@repometric/viz').then((mod) => mod.ArchitectureDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] rounded-panel border border-line bg-surface/50 animate-pulse flex items-center justify-center text-xs text-ink-muted">
        Loading interactive architecture diagram...
      </div>
    ),
  },
);

interface AnalysisResponse {
  cached: boolean;
  analysis: AnalysisReport & { id?: string };
  graph: {
    status: 'ready' | 'missing' | 'unsupported';
    data?: GraphData;
  };
  files: FileNode[];
  error?: { code: string; message: string };
}

export default function ReportPage({ params }: { params: { owner: string; repo: string } }) {
  const [activeTab, setActiveTab] = useState<'map' | 'graph' | 'diagram' | 'report'>('map');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: `${params.owner}/${params.repo}` }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error?.message || `Failed to analyze repository (${res.status})`);
        return;
      }

      setData(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error connecting to RepoMetric API.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.owner, params.repo]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const report = data?.analysis;
  const files = data?.files || [];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header>
        <RepoInput defaultValue={`${params.owner}/${params.repo}`} />
      </Header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-teal/20 border-t-teal animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-teal animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-lg font-heading font-semibold text-ink">
                Analyzing {params.owner}/{params.repo}...
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                Fetching Git tree, examining commit cadence, documentation, and calculating 0–100 health metrics.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="w-full max-w-xl mx-auto my-12 p-6 rounded-panel border border-danger/30 bg-danger/5 space-y-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-danger-text shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-semibold text-danger-text">Analysis failed</h3>
                <p className="text-xs text-ink leading-relaxed">{error}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2 border-t border-danger/20">
              <Button onClick={() => fetchAnalysis()} size="sm" variant="outline">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retry
              </Button>
              <Link href="/" className="text-xs text-ink-muted hover:text-ink">
                Go back home
              </Link>
            </div>
          </div>
        )}

        {/* Loaded Report View */}
        {!loading && !error && report && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Score Rail */}
            <ScoreRail report={report} onNavigateToFixes={() => setActiveTab('report')} />

            {/* Main Visualizer & Report Area */}
            <div className="flex-1 min-w-0">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as 'map' | 'graph' | 'diagram' | 'report')}
                className="w-full space-y-4"
              >
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <TabsList>
                    <TabsTrigger value="map" className="flex items-center space-x-1.5">
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Map ({files.length} files)</span>
                    </TabsTrigger>
                    <TabsTrigger value="graph" className="flex items-center space-x-1.5">
                      <Network className="w-3.5 h-3.5" />
                      <span>
                        Graph
                        {data?.graph?.data?.nodes?.length ? ` (${data.graph.data.nodes.length} nodes)` : ''}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="diagram" className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Diagram</span>
                    </TabsTrigger>
                    <TabsTrigger value="report" className="flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Report</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center space-x-3 text-xs text-ink-muted">
                    {data?.cached && (
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-line text-[10px] uppercase font-mono">
                        cached
                      </span>
                    )}
                    <a
                      href={`https://github.com/${report.repo.owner}/${report.repo.name}/tree/${report.commitSha}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center space-x-1 font-mono text-[11px]"
                      title="View commit on GitHub"
                    >
                      <span>sha: {report.commitSha.slice(0, 7)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Tab 1: Repo Map */}
                <TabsContent value="map" className="mt-0 focus-visible:outline-none">
                  {files.length > 0 ? (
                    <RepoMap files={files} height={600} />
                  ) : (
                    <div className="w-full h-[580px] rounded-panel border border-line bg-surface p-8 flex flex-col items-center justify-center text-center space-y-2">
                      <p className="text-xs text-ink-muted">No files found in repository tree.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 2: Dependency Graph */}
                <TabsContent value="graph" className="mt-0 focus-visible:outline-none">
                  {data?.graph?.data && data.graph.data.nodes.length > 0 ? (
                    <DependencyGraph data={data.graph.data} height={620} />
                  ) : (
                    <div className="w-full h-[580px] rounded-panel border border-line bg-surface p-8 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-fog/20 flex items-center justify-center text-teal mb-2">
                        <Network className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-heading font-semibold text-ink">
                        No module imports detected
                      </h3>
                      <p className="max-w-md text-xs text-ink-muted leading-relaxed">
                        No JavaScript, TypeScript, or Python imports were identified in this repository snapshot. The Repo Map treemap is available to explore all {files.length} files.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('map')}
                        className="mt-2 text-xs font-medium text-teal hover:underline inline-flex items-center space-x-1"
                      >
                        <span>Explore Repo Map treemap</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Architecture Diagram */}
                <TabsContent value="diagram" className="mt-0 focus-visible:outline-none">
                  {files.length > 0 ? (
                    <ArchitectureDiagram
                      files={files}
                      graph={data?.graph?.data || null}
                      owner={params.owner}
                      repo={params.repo}
                      sha={report.commitSha}
                      height={620}
                    />
                  ) : (
                    <div className="w-full h-[580px] rounded-panel border border-line bg-surface p-8 flex flex-col items-center justify-center text-center space-y-2">
                      <p className="text-xs text-ink-muted">No files found to build architecture diagram.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Detailed Health Report */}
                <TabsContent value="report" className="mt-0 space-y-6 focus-visible:outline-none">
                  {/* Six Categories Section */}
                  <section className="space-y-3">
                    <div>
                      <h3 className="text-base font-heading font-semibold text-ink">
                        Health categories
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Deterministic scores normalized across six key engineering dimensions.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {report.categories.map((category) => (
                        <CategoryRow key={category.id} category={category} />
                      ))}
                    </div>
                  </section>

                  {/* Prioritized Fixes Section */}
                  <section className="space-y-3 pt-4 border-t border-line">
                    <div>
                      <h3 className="text-base font-heading font-semibold text-ink">
                        Prioritized fix list
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Actions ordered by score points gained per effort to reach your projected score of {report.projectedScore}.
                      </p>
                    </div>

                    {report.fixes.length > 0 ? (
                      <div className="space-y-2.5">
                        {report.fixes.map((fix) => (
                          <FixItem key={fix.id} fix={fix} />
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-panel border border-line bg-surface text-xs text-ink-muted text-center">
                        No fixes needed! All applicable signals have achieved their maximum score.
                      </div>
                    )}
                  </section>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
