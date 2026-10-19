'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Network, Map as MapIcon, FileText } from 'lucide-react';
import { mockReport, mockFiles } from '@repometric/core';
import { Header } from '../../../../components/Header';
import { RepoInput } from '../../../../components/RepoInput';
import { ScoreRail } from '../../../../components/ScoreRail';
import { CategoryRow } from '../../../../components/CategoryRow';
import { FixItem } from '../../../../components/FixItem';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/Tabs';

// Lazy-load RepoMap for visualizer budget
const RepoMap = dynamic(() => import('@repometric/viz').then((mod) => mod.RepoMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[580px] rounded-panel border border-line bg-surface/50 animate-pulse flex items-center justify-center text-xs text-ink-muted">
      Loading interactive map...
    </div>
  ),
});

export default function ReportPage({ params }: { params: { owner: string; repo: string } }) {
  const [activeTab, setActiveTab] = useState<'map' | 'graph' | 'report'>('map');

  // For this front-end session, render from realistic mockReport updated with the route params
  const report = {
    ...mockReport,
    repo: {
      ...mockReport.repo,
      owner: params.owner,
      name: params.repo,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header>
        <RepoInput defaultValue={`${params.owner}/${params.repo}`} />
      </Header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Score Rail (collapses above canvas on mobile) */}
          <ScoreRail report={report} onNavigateToFixes={() => setActiveTab('report')} />

          {/* Main Visualizer & Report Area */}
          <div className="flex-1 min-w-0">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'map' | 'graph' | 'report')}
              className="w-full space-y-4"
            >
              <div className="flex items-center justify-between border-b border-line pb-2">
                <TabsList>
                  <TabsTrigger value="map" className="flex items-center space-x-1.5">
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>Map</span>
                  </TabsTrigger>
                  <TabsTrigger value="graph" className="flex items-center space-x-1.5">
                    <Network className="w-3.5 h-3.5" />
                    <span>Graph</span>
                  </TabsTrigger>
                  <TabsTrigger value="report" className="flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </TabsTrigger>
                </TabsList>

                <div className="text-xs text-ink-muted font-mono hidden sm:block">
                  commit: {report.commitSha.slice(0, 7)}
                </div>
              </div>

              {/* Tab 1: Repo Map */}
              <TabsContent value="map" className="mt-0 focus-visible:outline-none">
                <RepoMap files={mockFiles} height={600} />
              </TabsContent>

              {/* Tab 2: Dependency Graph (Coming Soon Placeholder) */}
              <TabsContent value="graph" className="mt-0 focus-visible:outline-none">
                <div className="w-full h-[580px] rounded-panel border border-line bg-surface p-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-fog/20 flex items-center justify-center text-teal mb-2">
                    <Network className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-ink">
                    Dependency graph coming next
                  </h3>
                  <p className="max-w-md text-xs text-ink-muted leading-relaxed">
                    The interactive force-directed graph of file imports and circular dependencies
                    is being prepared. The Repo Map is currently active and interactive.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('map')}
                    className="mt-2 text-xs font-medium text-teal hover:underline"
                  >
                    Switch to Repo Map
                  </button>
                </div>
              </TabsContent>

              {/* Tab 3: Full Detailed Health Report */}
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
                      Actions ordered by score points gained per effort to reach your projected
                      score of {report.projectedScore}.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {report.fixes.map((fix) => (
                      <FixItem key={fix.id} fix={fix} />
                    ))}
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
