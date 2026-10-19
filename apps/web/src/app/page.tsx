import React from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { RepoInput } from '../components/RepoInput';
import { HeroPreview } from '../components/HeroPreview';
import { Tilly } from '../components/Tilly';
import { StickerBadge } from '../components/StickerBadge';
import { Card } from '../components/Card';
import {
  DemoScoreReceipts,
  DemoFixList,
  DemoTreemapZoom,
  DemoDependencyGraph,
  DemoArchitecture,
  DemoShowItOff,
} from '../components/WhatYouGetDemos';
import { FaqAccordion } from '../components/FaqAccordion';
import {
  ShieldCheck,
  Eye,
  Lock,
  Database,
  Activity,
  GitPullRequest,
  Users,
  FileText,
  Boxes,
  ArrowRight,
  GraduationCap,
  Compass,
  Briefcase,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-body selection:bg-lime selection:text-ink">
      {/* 1.1 Nav (sticky) */}
      <Header />

      <main className="flex-1">
        {/* 1.2 Hero */}
        <section className="relative overflow-hidden px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b-2 border-ink bg-paper">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading, Subline, Input */}
            <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
              <div className="inline-flex items-center space-x-2">
                <StickerBadge variant="sun" size="sm" rotate="left">
                  Zero LLM • Deterministic Field Guide
                </StickerBadge>
              </div>

              <h1 className="font-display font-extrabold text-hero text-ink tracking-tight leading-[1.05]">
                Is your repo any good?{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">Find out in 10 seconds.</span>
                  {/* Lime marker underlay swipe */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 right-0 h-4 sm:h-5 bg-lime -rotate-1 -z-0 rounded-[4px] border border-ink/30"
                  />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl">
                Paste a GitHub link. Get a health score, a to-do list that fixes it, and an
                interactive map of your code. Free, no sign-up.
              </p>

              {/* Big RepoInput */}
              <div className="pt-2">
                <RepoInput id="repo-input-field" autoFocus />
              </div>

              {/* Trust line */}
              <div className="flex items-center space-x-2 text-xs font-semibold text-ink-muted justify-center sm:justify-start">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Read-only. We never run your code or store it.</span>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* 1.3 How it works */}
        <section id="how-it-works" className="py-16 sm:py-20 px-4 border-b-2 border-ink bg-paper-2 bg-dots">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <StickerBadge variant="primary" rotate="left">
                Simple 3-Step Sequence
              </StickerBadge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                How it works
              </h2>
              <p className="text-sm text-ink-muted">
                Fast, deterministic analysis from public GitHub data. Takes about 10 seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <Card hoverLift className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-ink bg-sun flex items-center justify-center font-display font-extrabold text-lg text-ink shadow-[2px_2px_0_var(--ink)]">
                    1
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Paste a link</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Any public GitHub repo. No sign-up, no OAuth, and no credit card required.
                  </p>
                </div>
                <div className="p-3 rounded-control border-2 border-ink bg-paper font-mono text-xs text-ink truncate shadow-[1px_1px_0_var(--ink)]">
                  github.com/expressjs/express
                </div>
              </Card>

              {/* Step 2 */}
              <Card hoverLift className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-ink bg-lime flex items-center justify-center font-display font-extrabold text-lg text-ink shadow-[2px_2px_0_var(--ink)]">
                    2
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">We read the public data</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Commits, issues, files and imports. Nothing is cloned or run on our servers.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-ink bg-paper p-2.5 rounded-control border-2 border-ink shadow-[1px_1px_0_var(--ink)]">
                  <CheckCircle2 className="w-4 h-4 text-lime stroke-[3]" />
                  <span>Public AST & REST metadata</span>
                </div>
              </Card>

              {/* Step 3 */}
              <Card hoverLift className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-ink bg-sky flex items-center justify-center font-display font-extrabold text-lg text-ink shadow-[2px_2px_0_var(--ink)]">
                    3
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Get your report</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    A 0–100 health score, a prioritized fix list, and interactive visualizers of your code.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-ink bg-paper p-2.5 rounded-control border-2 border-ink shadow-[1px_1px_0_var(--ink)]">
                  <span>Score + Map + Diagram</span>
                  <span className="font-mono text-primary-text">~10s</span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 1.4 What you get */}
        <section id="what-you-get" className="py-16 sm:py-24 px-4 border-b-2 border-ink bg-paper space-y-20 max-w-6xl mx-auto">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <StickerBadge variant="lime" rotate="right">
              Complete Feature Suite
            </StickerBadge>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
              What you get
            </h2>
            <p className="text-sm text-ink-muted">
              Every deliverable is interactive, reproducible, and explained in plain language.
            </p>
          </div>

          {/* Block 1: Score with receipts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold text-primary-text uppercase">Deliverable 01</span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                A score with receipts
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                Six areas, 23 checks, every point explained. No mystery number or black-box rating.
              </p>
            </div>
            <div className="lg:col-span-7">
              <DemoScoreReceipts />
            </div>
          </div>

          {/* Block 2: Fix list, sorted by payoff (Image flips left) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <DemoFixList />
            </div>
            <div className="lg:col-span-5 space-y-3 order-1 lg:order-2">
              <span className="font-mono text-xs font-bold text-primary-text uppercase">Deliverable 02</span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                A to-do list, sorted by payoff
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                Add a license: +4 points, about 2 minutes. Fixes are ranked by points gained per effort so you can make fast gains.
              </p>
            </div>
          </div>

          {/* Block 3: Whole repo at a glance (Treemap) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold text-primary-text uppercase">Deliverable 03</span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                See the whole repo at a glance
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                Every file is a tile. Bigger tile, bigger file. Click any folder to zoom in and discover hidden hotspots.
              </p>
            </div>
            <div className="lg:col-span-7">
              <DemoTreemapZoom />
            </div>
          </div>

          {/* Block 4: Who depends on whom (Image flips left) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <DemoDependencyGraph />
            </div>
            <div className="lg:col-span-5 space-y-3 order-1 lg:order-2">
              <span className="font-mono text-xs font-bold text-primary-text uppercase">Deliverable 04</span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                Who depends on whom
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                Spot the file everything relies on, and the circular imports that cause headaches in your CI pipeline.
              </p>
            </div>
          </div>

          {/* Block 5: Architecture drawn for you */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-xs font-bold text-primary-text uppercase">Deliverable 05</span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
                The architecture, drawn for you
              </h3>
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                Components, layers and the services they use, as a clean flowchart you can paste directly into your README.
              </p>
            </div>
            <div className="lg:col-span-7">
              <DemoArchitecture />
            </div>
          </div>

          {/* Block 6: Show it off (small block) */}
          <div className="p-6 rounded-card border-2 border-ink bg-paper-2 shadow-[4px_4px_0_var(--ink)]">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center space-y-1">
                <span className="font-mono text-xs font-bold text-primary-text uppercase">Deliverable 06</span>
                <h3 className="font-display font-extrabold text-2xl text-ink tracking-tight">
                  Show it off
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted">
                  A live SVG badge for your README, and a zero-install CLI command for your terminal.
                </p>
              </div>
              <DemoShowItOff />
            </div>
          </div>
        </section>

        {/* 1.5 Who it's for (Bento layout with varied tile sizes) */}
        <section className="py-16 sm:py-20 px-4 border-b-2 border-ink bg-paper-2 bg-dots">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <StickerBadge variant="sun" rotate="left">
                Audience Bento
              </StickerBadge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                Who it&apos;s for
              </h2>
              <p className="text-sm text-ink-muted">
                From interview prep to CI automation: built for anyone reading code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Students (Large tile, 7 cols) */}
              <div className="md:col-span-7 rounded-card border-2 border-ink bg-card p-6 shadow-[4px_4px_0_var(--ink)] hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-lime flex items-center justify-center text-ink shadow-[2px_2px_0_var(--ink)]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Students</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Polish your portfolio repos before placements. Turn vague project directories into production-ready showcases with tests, licenses, and architecture docs.
                  </p>
                </div>
                <div className="p-3 rounded-control border border-ink/40 bg-paper-2 text-xs font-mono text-ink">
                  &ldquo;Took my portfolio repo from 62 to 91 in one weekend.&rdquo;
                </div>
              </div>

              {/* Open-source newcomers (5 cols) */}
              <div className="md:col-span-5 rounded-card border-2 border-ink bg-card p-6 shadow-[4px_4px_0_var(--ink)] hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-sky flex items-center justify-center text-ink shadow-[2px_2px_0_var(--ink)]">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Open-source newcomers</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Understand a new codebase in minutes before opening your first pull request.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-primary-text">
                  Instant visual navigation &rarr;
                </span>
              </div>

              {/* Recruiters (5 cols) */}
              <div className="md:col-span-5 rounded-card border-2 border-ink bg-card p-6 shadow-[4px_4px_0_var(--ink)] hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-sun flex items-center justify-center text-ink shadow-[2px_2px_0_var(--ink)]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Recruiters & Leads</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Judge a repo in 30 seconds. Verify genuine engineering hygiene, CI test coverage, and documentation.
                  </p>
                </div>
                <div className="text-xs font-mono text-ink-muted">
                  0-100 objective score benchmarks
                </div>
              </div>

              {/* Maintainers (7 cols) */}
              <div className="md:col-span-7 rounded-card border-2 border-ink bg-card p-6 shadow-[4px_4px_0_var(--ink)] hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-coral flex items-center justify-center text-ink shadow-[2px_2px_0_var(--ink)]">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Maintainers</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Fail CI when repository health drops. Run `npx repometric --min-score 80` in GitHub Actions to stop hygiene rot.
                  </p>
                </div>
                <div className="font-mono text-xs bg-paper-2 p-2.5 rounded-control border border-ink/40 text-ink">
                  repometric --min-score 85 --json
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1.6 What we check */}
        <section className="py-16 px-4 border-b-2 border-ink bg-paper">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-display font-extrabold text-3xl text-ink tracking-tight">
                What we check
              </h2>
              <p className="text-sm text-ink-muted">
                Six dimensions covering the complete engineering lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Activity', desc: 'Cadence & releases', icon: <Activity className="w-4 h-4 text-primary" /> },
                { label: 'Maintenance', desc: 'Issue resolution', icon: <GitPullRequest className="w-4 h-4 text-lime" /> },
                { label: 'Community', desc: 'Governance & code', icon: <Users className="w-4 h-4 text-sky" /> },
                { label: 'Docs', desc: 'README & license', icon: <FileText className="w-4 h-4 text-sun" /> },
                { label: 'Hygiene', desc: 'CI & git hygiene', icon: <ShieldCheck className="w-4 h-4 text-lime" /> },
                { label: 'Dependencies', desc: 'Vulnerabilities', icon: <Boxes className="w-4 h-4 text-coral" /> },
              ].map((c) => (
                <div
                  key={c.label}
                  className="p-3.5 rounded-control border-2 border-ink bg-card shadow-[2px_2px_0_var(--ink)] text-center space-y-1 hover:-translate-y-0.5 transition-transform"
                >
                  <div className="w-7 h-7 mx-auto rounded border border-ink bg-paper-2 flex items-center justify-center">
                    {c.icon}
                  </div>
                  <div className="font-bold text-xs text-ink">{c.label}</div>
                  <p className="text-[10px] text-ink-muted">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/methodology"
                className="inline-flex items-center space-x-1 font-bold text-sm text-primary-text hover:underline"
              >
                <span>See every check and arithmetic rule</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 1.7 Try a real repo (gallery) */}
        <section className="py-16 sm:py-20 px-4 border-b-2 border-ink bg-paper-2 bg-dots">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <StickerBadge variant="sun" rotate="left">
                  Sample Gallery
                </StickerBadge>
                <h2 className="font-display font-extrabold text-3xl text-ink tracking-tight">
                  Try a pre-analyzed repo
                </h2>
                <p className="text-sm text-ink-muted">
                  Click any card to open its instant report page with full visualizers.
                </p>
              </div>
              <span className="text-xs font-mono text-ink-muted self-start sm:self-auto">
                Sample preview benchmarks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { owner: 'facebook', repo: 'react', score: 88, grade: 'Good', variant: 'sky' as const, desc: 'Component library hub' },
                { owner: 'expressjs', repo: 'express', score: 78, grade: 'Good', variant: 'sky' as const, desc: 'Fast, unopinionated web framework' },
                { owner: 'pallets', repo: 'flask', score: 82, grade: 'Good', variant: 'sky' as const, desc: 'Python micro web framework' },
                { owner: 'vercel', repo: 'next.js', score: 91, grade: 'Excellent', variant: 'lime' as const, desc: 'React framework for the web' },
                { owner: 'tailwindlabs', repo: 'tailwindcss', score: 85, grade: 'Good', variant: 'sky' as const, desc: 'Utility-first CSS framework' },
                { owner: 'torvalds', repo: 'linux', score: 72, grade: 'Needs work', variant: 'sun' as const, desc: 'Linux kernel tree' },
              ].map((r) => (
                <Link
                  key={`${r.owner}/${r.repo}`}
                  href={`/r/${r.owner}/${r.repo}`}
                  className="p-5 rounded-card border-2 border-ink bg-card shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--ink)] transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs font-bold text-ink-muted group-hover:text-primary-text transition-colors truncate">
                        {r.owner}/
                      </span>
                      <StickerBadge variant={r.variant} size="sm" rotate="right">
                        {r.grade}
                      </StickerBadge>
                    </div>
                    <div className="font-display font-extrabold text-xl text-ink truncate">
                      {r.repo}
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                      {r.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-ink/20">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-display font-extrabold text-2xl text-ink leading-none">
                        {r.score}
                      </span>
                      <span className="text-[10px] font-mono text-ink-muted">/100</span>
                    </div>
                    <span className="text-xs font-bold text-primary-text flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 1.8 Privacy and trust */}
        <section className="py-16 px-4 border-b-2 border-ink bg-paper">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-display font-extrabold text-3xl text-ink tracking-tight">
                Privacy & Trust
              </h2>
              <p className="text-sm text-ink-muted">
                Transparent by design. You never have to worry about IP leaks or security traps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card hoverLift className="p-5 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-control border-2 border-ink bg-lime flex items-center justify-center text-ink shadow-[2px_2px_0_var(--ink)]">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-ink">Read-only</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  We only request read access to public metadata. No write permissions ever.
                </p>
              </Card>

              <Card hoverLift className="p-5 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-control border-2 border-ink bg-sky flex items-center justify-center text-ink shadow-[2px_2px_0_var(--ink)]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-ink">Public repos only</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  No risk of exposing confidential or private proprietary code.
                </p>
              </Card>

              <Card hoverLift className="p-5 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-control border-2 border-ink bg-coral flex items-center justify-center text-ink shadow-[2px_2px_0_var(--ink)]">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-ink">We never run code</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Analyzed files are parsed for imports and metadata, never compiled or executed.
                </p>
              </Card>

              <Card hoverLift className="p-5 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-control border-2 border-ink bg-sun flex items-center justify-center text-ink shadow-[2px_2px_0_var(--ink)]">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-ink">Scores stored only</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  We cache scores, metrics, and import maps. Your raw source is never stored.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* 1.9 FAQ */}
        <section id="faq" className="py-16 sm:py-20 px-4 border-b-2 border-ink bg-paper-2 bg-dots">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <StickerBadge variant="primary" rotate="right">
                Frequently Answered
              </StickerBadge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* 1.10 Final Call to Action */}
        <section className="py-16 sm:py-24 px-4 bg-paper border-b-2 border-ink">
          <div className="max-w-4xl mx-auto rounded-card border-2 border-ink bg-card p-8 sm:p-12 shadow-[6px_6px_0_var(--ink)] flex flex-col items-center text-center space-y-6">
            <Tilly mood="happy" size={88} />
            <div className="space-y-2 max-w-lg">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                Ready? Paste a repo link.
              </h2>
              <p className="text-sm text-ink-muted">
                Inspect your score, get your prioritized fix list, and explore your interactive treemap now.
              </p>
            </div>
            <div className="w-full max-w-xl">
              <RepoInput id="repo-input-bottom" />
            </div>
          </div>
        </section>
      </main>

      {/* 1.11 Footer */}
      <footer className="py-10 px-4 bg-paper-2 text-ink text-xs border-t-2 border-ink">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <Tilly mood="idle" size={24} />
            <span className="font-display font-bold text-sm tracking-tight text-ink">
              repometric
            </span>
            <span className="text-ink-muted">• Field guide for public code</span>
          </div>

          <div className="flex items-center space-x-6 font-bold text-ink">
            <Link href="/methodology" className="hover:underline">
              Methodology
            </Link>
            <Link href="/kit" className="hover:underline">
              Design Kit
            </Link>
            <a
              href="https://github.com/Hemacharankodhanda/repometric"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://npmjs.com/package/repometric"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              npm
            </a>
          </div>

          <div className="text-ink-muted text-center sm:text-right">
            Built by{' '}
            <a
              href="https://github.com/Hemacharankodhanda"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-ink underline"
            >
              Hemacharan Kodhanda
            </a>
            . $0 cost, free tiers, zero AI APIs.
          </div>
        </div>
      </footer>
    </div>
  );
}
