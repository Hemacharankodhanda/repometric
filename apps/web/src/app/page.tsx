import React from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { RepoInput } from '../components/RepoInput';
import { HeroPreview } from '../components/HeroPreview';
import { Tilly } from '../components/Tilly';
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
    <div className="min-h-screen flex flex-col bg-paper text-ink font-body relative overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-200">
      {/* 1.1 Nav (sticky frosted glass) */}
      <Header />

      <main className="flex-1">
        {/* ─── 1.2 Hero ─── */}
        <section className="relative px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-[var(--border-color)]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left column */}
            <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[var(--card)] text-ink border border-[var(--border-color)] shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Deterministic AST Engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[var(--card)] text-ink-muted border border-[var(--border-color)] shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  100% Free &amp; Open Source
                </span>
              </div>

              <h1 className="font-display font-extrabold text-hero text-ink tracking-tight leading-[1.08]">
                Is your repo any good?{' '}
                <span className="text-primary font-bold">
                  Find out in 10 seconds.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl">
                Paste a public GitHub link. Get a 0–100 health score with receipts, a prioritized
                to-do list, and an interactive zoomable map of your codebase.
              </p>

              {/* Big RepoInput */}
              <div className="pt-2">
                <RepoInput id="repo-input-field" autoFocus />
              </div>

              {/* Trust line */}
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted justify-center sm:justify-start pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Read-only analysis. We never clone, execute, or store your code.</span>
              </div>
            </div>

            {/* Right column — interactive preview */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* ─── 1.3 How it works ─── */}
        <section
          id="how-it-works"
          className="py-20 sm:py-24 px-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40"
        >
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[var(--card)] text-ink border border-[var(--border-color)]">
                Workflow steps
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
                How it works
              </h2>
              <p className="text-sm text-ink-muted">
                Fast, deterministic analysis from public GitHub data. Takes about 10 seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="gh-box p-5 flex flex-col justify-between space-y-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-primary">step: 1/3</span>
                    <span className="gh-counter font-mono">input</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink">Paste a repository link</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Any public GitHub repo. No sign-up, no OAuth permissions, and zero API tokens
                    required.
                  </p>
                </div>
                <div className="p-2.5 rounded-md border border-[var(--border-color)] bg-[var(--paper)] font-mono text-xs text-ink truncate">
                  github.com/expressjs/express
                </div>
              </div>

              {/* Step 2 */}
              <div className="gh-box p-5 flex flex-col justify-between space-y-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-primary">step: 2/3</span>
                    <span className="gh-counter font-mono">ast-parse</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink">
                    Parse public data
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Commits, issues, files and imports. Nothing is cloned or run on our servers.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-md border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Public AST &amp; REST metadata</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="gh-box p-5 flex flex-col justify-between space-y-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-primary">step: 3/3</span>
                    <span className="gh-counter font-mono">~10s</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink">Get your report</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    A 0–100 health score, a prioritized fix list, and interactive visualizers of
                    your code.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-ink bg-[var(--paper)] p-2 rounded-md border border-[var(--border-color)]">
                  <span>Score + Map + Graph</span>
                  <span className="font-mono text-[11px] text-ink-muted">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 1.4 What you get ─── */}
        <section
          id="what-you-get"
          className="py-20 sm:py-28 px-4 border-b border-[var(--border-color)] bg-paper"
        >
          <div className="max-w-6xl mx-auto space-y-20">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[var(--card)] text-ink border border-[var(--border-color)]">
                Feature deliverables
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
                What you get
              </h2>
              <p className="text-sm text-ink-muted">
                Every deliverable is interactive, reproducible, and explained in plain language.
              </p>
            </div>

            {/* Block 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <span className="gh-counter font-mono text-xs">01 / Scorecard</span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                  A score with receipts
                </h3>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Six areas, 23 checks, every point explained. No mystery number or black-box
                  rating.
                </p>
              </div>
              <div className="lg:col-span-7">
                <DemoScoreReceipts />
              </div>
            </div>

            {/* Block 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <DemoFixList />
              </div>
              <div className="lg:col-span-5 space-y-3 order-1 lg:order-2">
                <span className="gh-counter font-mono text-xs">02 / Fixes</span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                  A to-do list, sorted by payoff
                </h3>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Add a license: +4 points, about 2 minutes. Fixes are ranked by points gained per
                  effort so you can make fast gains.
                </p>
              </div>
            </div>

            {/* Block 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <span className="gh-counter font-mono text-xs">03 / Repo Map</span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                  See the whole repo at a glance
                </h3>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Every file is a tile. Bigger tile, bigger file. Click any folder to zoom in and
                  discover hidden hotspots.
                </p>
              </div>
              <div className="lg:col-span-7">
                <DemoTreemapZoom />
              </div>
            </div>

            {/* Block 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <DemoDependencyGraph />
              </div>
              <div className="lg:col-span-5 space-y-3 order-1 lg:order-2">
                <span className="gh-counter font-mono text-xs">04 / Imports</span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                  Who depends on whom
                </h3>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Spot the file everything relies on, and the circular imports that cause headaches
                  in your CI pipeline.
                </p>
              </div>
            </div>

            {/* Block 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <span className="gh-counter font-mono text-xs">05 / Diagram</span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                  The architecture, drawn for you
                </h3>
                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  Components, layers and the services they use, as a clean flowchart you can paste
                  directly into your README.
                </p>
              </div>
              <div className="lg:col-span-7">
                <DemoArchitecture />
              </div>
            </div>

            {/* Block 6: Show it off */}
            <div className="p-6 sm:p-8 gh-box shadow-sm">
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="text-center space-y-2">
                  <span className="gh-counter font-mono text-xs">06 / Badges</span>
                  <h3 className="font-display font-bold text-2xl text-ink tracking-tight">
                    Show it off
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted">
                    A live SVG badge for your README, and a zero-install CLI command for your
                    terminal.
                  </p>
                </div>
                <DemoShowItOff />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 1.5 Who it's for ─── */}
        <section className="py-20 sm:py-24 px-4 border-b border-[var(--border-color)] bg-[var(--paper)]">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[var(--card)] text-ink border border-[var(--border-color)]">
                Target workflows
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
                Who it&apos;s for
              </h2>
              <p className="text-sm text-ink-muted">
                From interview prep to CI automation: built for anyone reading code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Students — wide tile */}
              <div className="md:col-span-7 gh-box p-6 sm:p-8 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink">Students</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    Polish your portfolio repos before placements. Turn vague project directories
                    into production-ready showcases with tests, licenses, and architecture docs.
                  </p>
                </div>
                <div className="p-2.5 rounded-md border border-[var(--border-color)] bg-[var(--paper)] text-xs font-mono text-ink">
                  &ldquo;Took my portfolio repo from 62 to 91 in one weekend.&rdquo;
                  <span className="ml-2 text-ink-muted font-sans">(sample)</span>
                </div>
              </div>

              {/* Open-source newcomers */}
              <div className="md:col-span-5 gh-box p-6 sm:p-8 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink">Open-source newcomers</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    Understand a new codebase in minutes before opening your first pull request.
                  </p>
                </div>
                <div className="p-2 rounded-md border border-[var(--border-color)] bg-[var(--paper)] inline-block w-fit">
                  <span className="text-xs font-mono font-medium text-primary">
                    Instant visual navigation →
                  </span>
                </div>
              </div>

              {/* Recruiters */}
              <div className="md:col-span-5 gh-box p-6 sm:p-8 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink">Recruiters &amp; leads</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    Judge a repo in 30 seconds. Verify genuine engineering hygiene, CI test coverage,
                    and documentation.
                  </p>
                </div>
                <div className="p-2 rounded-md border border-[var(--border-color)] bg-[var(--paper)] inline-block w-fit text-xs font-mono font-medium text-ink">
                  0–100 objective score benchmarks
                </div>
              </div>

              {/* Maintainers — wide tile */}
              <div className="md:col-span-7 gh-box p-6 sm:p-8 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-ink">Maintainers</h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    Fail CI when repository health drops. Run{' '}
                    <code className="font-mono bg-[var(--paper)] px-1 py-0.5 rounded text-xs border border-[var(--border-color)]">
                      npx repometric --min-score 80
                    </code>{' '}
                    in GitHub Actions to stop hygiene rot.
                  </p>
                </div>
                <div className="font-mono text-xs bg-[#0d1117] text-[#e6edf3] p-3 rounded-md border border-[#30363d] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#7ee787]">$</span>
                    <span>npx repometric --min-score 85 --json</span>
                  </div>
                  <span className="text-[10px] text-[#8d96a0] font-sans">GitHub Actions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 1.6 What we check ─── */}
        <section className="py-20 px-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-paper">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <h2 className="font-display font-bold text-3xl text-ink tracking-tight">
                What we check
              </h2>
              <p className="text-sm text-ink-muted">
                Six dimensions covering the complete engineering lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
              {[
                {
                  label: 'Activity',
                  desc: 'Cadence & releases',
                  icon: <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
                  bg: 'bg-indigo-500/10 border-indigo-500/20',
                },
                {
                  label: 'Maintenance',
                  desc: 'Issue resolution',
                  icon: <GitPullRequest className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
                  bg: 'bg-sky-500/10 border-sky-500/20',
                },
                {
                  label: 'Community',
                  desc: 'Governance & code',
                  icon: <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
                  bg: 'bg-teal-500/10 border-teal-500/20',
                },
                {
                  label: 'Docs',
                  desc: 'README & license',
                  icon: <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
                  bg: 'bg-amber-500/10 border-amber-500/20',
                },
                {
                  label: 'Hygiene',
                  desc: 'CI & git hygiene',
                  icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                  bg: 'bg-emerald-500/10 border-emerald-500/20',
                },
                {
                  label: 'Dependencies',
                  desc: 'Vulnerabilities',
                  icon: <Boxes className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
                  bg: 'bg-rose-500/10 border-rose-500/20',
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="p-3.5 gh-box hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-center space-y-2 shadow-xs"
                >
                  <div
                    className={`w-8 h-8 mx-auto rounded-md border flex items-center justify-center ${c.bg}`}
                  >
                    {c.icon}
                  </div>
                  <div className="font-semibold text-xs text-ink">{c.label}</div>
                  <p className="text-[11px] text-ink-muted">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/methodology"
                className="gh-btn inline-flex items-center space-x-1.5"
              >
                <span>See all 23 checks and scoring arithmetic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 1.7 Try a real repo (gallery) ─── */}
        <section className="py-20 sm:py-24 px-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[var(--card)] text-ink border border-[var(--border-color)]">
                  Sample repos
                </span>
                <h2 className="font-display font-bold text-3xl text-ink tracking-tight">
                  Try a pre-analyzed repo
                </h2>
                <p className="text-sm text-ink-muted">
                  Click any card to open its instant report page with full visualizers.
                </p>
              </div>
              <span className="gh-counter font-mono text-xs">
                Benchmark repositories
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[
                {
                  owner: 'facebook',
                  repo: 'react',
                  score: 88,
                  grade: 'Good',
                  variant: 'sky' as const,
                  desc: 'The library for web and native user interfaces.',
                  lang: 'JavaScript',
                  langColor: '#f1e05a',
                  license: 'MIT',
                },
                {
                  owner: 'expressjs',
                  repo: 'express',
                  score: 78,
                  grade: 'Good',
                  variant: 'sky' as const,
                  desc: 'Fast, unopinionated, minimalist web framework for node.',
                  lang: 'JavaScript',
                  langColor: '#f1e05a',
                  license: 'MIT',
                },
                {
                  owner: 'pallets',
                  repo: 'flask',
                  score: 82,
                  grade: 'Good',
                  variant: 'sky' as const,
                  desc: 'The Python micro framework for building web applications.',
                  lang: 'Python',
                  langColor: '#3572a5',
                  license: 'BSD-3',
                },
                {
                  owner: 'vercel',
                  repo: 'next.js',
                  score: 91,
                  grade: 'Excellent',
                  variant: 'lime' as const,
                  desc: 'The React Framework for the Web created by Vercel.',
                  lang: 'TypeScript',
                  langColor: '#3178c6',
                  license: 'MIT',
                },
                {
                  owner: 'tailwindlabs',
                  repo: 'tailwindcss',
                  score: 85,
                  grade: 'Good',
                  variant: 'sky' as const,
                  desc: 'A utility-first CSS framework for rapid UI development.',
                  lang: 'TypeScript',
                  langColor: '#3178c6',
                  license: 'MIT',
                },
                {
                  owner: 'torvalds',
                  repo: 'linux',
                  score: 72,
                  grade: 'Needs work',
                  variant: 'sun' as const,
                  desc: 'Linux kernel source tree maintained by Linus Torvalds.',
                  lang: 'C',
                  langColor: '#555555',
                  license: 'GPL-2.0',
                },
              ].map((r) => (
                <div key={`${r.owner}/${r.repo}`} className="h-full">
                  <Link
                    href={`/r/${r.owner}/${r.repo}`}
                    className="gh-box p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col justify-between space-y-3 group block h-full"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="font-semibold text-sm text-primary group-hover:underline truncate">
                            {r.owner}/{r.repo}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full border border-[var(--border-color)] text-[10px] text-ink-muted">
                            Public
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full border border-[var(--border-color)] bg-[var(--paper)] text-[11px] font-mono font-medium text-ink">
                          {r.score}/100
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{r.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-color)] text-xs text-ink-muted">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: r.langColor }}
                          />
                          <span className="font-mono text-[11px]">{r.lang}</span>
                        </div>
                        <span className="text-[11px] font-mono">{r.license}</span>
                      </div>
                      <div className="flex items-baseline space-x-1 font-mono">
                        <span className="font-bold text-ink">{r.score}</span>
                        <span className="text-[10px] text-ink-muted">/100</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 1.8 Privacy and trust ─── */}
        <section className="py-20 px-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-paper">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <h2 className="font-display font-bold text-3xl text-ink tracking-tight">
                Privacy &amp; trust
              </h2>
              <p className="text-sm text-ink-muted">
                Transparent by design. You never have to worry about IP leaks or security traps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                {
                  icon: <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                  bg: 'bg-emerald-500/10 border-emerald-500/20',
                  title: 'Read-only',
                  body: 'We only request read access to public metadata. No write permissions ever.',
                },
                {
                  icon: <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
                  bg: 'bg-sky-500/10 border-sky-500/20',
                  title: 'Public repos only',
                  body: 'No risk of exposing confidential or private proprietary code.',
                },
                {
                  icon: <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
                  bg: 'bg-rose-500/10 border-rose-500/20',
                  title: 'We never run code',
                  body: 'Analyzed files are parsed for imports and metadata, never compiled or executed.',
                },
                {
                  icon: <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
                  bg: 'bg-amber-500/10 border-amber-500/20',
                  title: 'Scores stored only',
                  body: 'We cache scores, metrics, and import maps. Your raw source is never stored.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-card hover:-translate-y-1 hover:shadow-card-lg transition-all duration-150 text-center space-y-3"
                >
                  <div
                    className={`w-11 h-11 mx-auto rounded-xl border flex items-center justify-center ${item.bg}`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-display font-semibold text-base text-ink">{item.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 1.9 FAQ ─── */}
        <section
          id="faq"
          className="py-20 sm:py-24 px-4 border-b border-[var(--border-color)] bg-[var(--paper)]"
        >
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[var(--card)] text-ink border border-[var(--border-color)]">
                Documentation
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
                Frequently asked questions
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* ─── 1.10 Final call to action ─── */}
        <section className="py-20 sm:py-28 px-4 bg-paper relative">
          <div className="max-w-4xl mx-auto gh-box p-8 sm:p-14 shadow-xs flex flex-col items-center text-center space-y-6">
            <Tilly mood="happy" size={72} />
            <div className="space-y-2 max-w-lg">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                Ready? Paste a repo link.
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted">
                Inspect your score, get your prioritized fix list, and explore your interactive
                treemap now.
              </p>
            </div>
            <div className="w-full max-w-xl">
              <RepoInput id="repo-input-bottom" />
            </div>
          </div>
        </section>
      </main>

      {/* ─── 1.11 GitHub-style Footer ─── */}
      <footer className="py-8 px-4 bg-[var(--paper)] text-ink-muted text-xs border-t border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Tilly mood="idle" size={20} />
            <span className="font-semibold text-ink">RepoMetric</span>
            <span>© 2026 Hemacharan Kodhanda</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-normal text-xs">
            <Link href="/methodology" className="hover:text-primary transition-colors">
              Methodology
            </Link>
            <Link href="/kit" className="hover:text-primary transition-colors">
              Design Kit
            </Link>
            <a
              href="https://github.com/Hemacharankodhanda/repometric"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://npmjs.com/package/repometric"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              npm
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2da44e] animate-pulse" />
            <span className="text-[11px] font-mono">100% Free &amp; Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
