import React from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { RepoInput } from '../components/RepoInput';
import { HeroPreview } from '../components/HeroPreview';
import { Tilly } from '../components/Tilly';
import { StickerBadge } from '../components/StickerBadge';
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

/** Lime marker SVG underlay behind a text run — spec §3 */
function LimeMarker({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline whitespace-nowrap">
      {/* SVG marker drawn behind the text */}
      <svg
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[2px] w-full h-[0.55em] pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 12"
      >
        <rect x="0" y="2" width="100" height="9" rx="2" fill="var(--lime)" opacity="0.55" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-body selection:bg-lime/30 selection:text-ink">
      {/* 1.1 Nav (sticky) */}
      <Header />

      <main className="flex-1">
        {/* ─── 1.2 Hero ─── */}
        <section className="px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 border-b-2 border-ink bg-paper">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left column */}
            <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <StickerBadge variant="primary" size="sm">
                  Deterministic AST engine
                </StickerBadge>
                <StickerBadge variant="lime" size="sm" rotate="right">
                  100% free &amp; open source
                </StickerBadge>
              </div>

              <h1 className="font-display font-extrabold text-hero text-ink tracking-tight leading-[1.08]">
                Is your repo any good?{' '}
                <LimeMarker>Find out in 10 seconds.</LimeMarker>
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
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted justify-center sm:justify-start pt-1">
                <ShieldCheck className="w-4 h-4 text-ink shrink-0" />
                <span>Read-only. We never run your code or store it.</span>
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
          className="py-20 sm:py-24 px-4 border-b-2 border-ink bg-dots"
        >
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <StickerBadge variant="primary">Simple 3-step sequence</StickerBadge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                How it works
              </h2>
              <p className="text-sm text-ink-muted">
                Fast, deterministic analysis from public GitHub data. Takes about 10 seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-card border-2 border-ink bg-card shadow-card flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-primary flex items-center justify-center font-display font-extrabold text-base text-white shadow-card-sm">
                    1
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Paste a link</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Any public GitHub repo. No sign-up, no OAuth, and no credit card required.
                  </p>
                </div>
                <div className="p-3 rounded-control border-2 border-ink bg-paper-2 font-mono text-xs text-ink truncate">
                  github.com/expressjs/express
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-card border-2 border-ink bg-card shadow-card flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-sky flex items-center justify-center font-display font-extrabold text-base text-ink shadow-card-sm">
                    2
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">
                    We read the public data
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Commits, issues, files and imports. Nothing is cloned or run on our servers.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-ink bg-lime p-2.5 rounded-control border-2 border-ink">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Public AST &amp; REST metadata</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-card border-2 border-ink bg-card shadow-card flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-lime flex items-center justify-center font-display font-extrabold text-base text-ink shadow-card-sm">
                    3
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Get your report</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    A 0–100 health score, a prioritized fix list, and interactive visualizers of
                    your code.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-ink bg-sun p-2.5 rounded-control border-2 border-ink">
                  <span>Score + Map + Diagram</span>
                  <span className="font-mono font-bold">~10 s</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 1.4 What you get ─── */}
        <section
          id="what-you-get"
          className="py-20 sm:py-28 px-4 border-b-2 border-ink bg-paper"
        >
          <div className="max-w-6xl mx-auto space-y-20">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <StickerBadge variant="lime">Complete feature suite</StickerBadge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                What you get
              </h2>
              <p className="text-sm text-ink-muted">
                Every deliverable is interactive, reproducible, and explained in plain language.
              </p>
            </div>

            {/* Block 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-3">
                <StickerBadge variant="primary" size="sm">Deliverable 01</StickerBadge>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
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
                <StickerBadge variant="sun" size="sm">Deliverable 02</StickerBadge>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
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
                <StickerBadge variant="lime" size="sm">Deliverable 03</StickerBadge>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
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
                <StickerBadge variant="sky" size="sm">Deliverable 04</StickerBadge>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
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
                <StickerBadge variant="coral" size="sm">Deliverable 05</StickerBadge>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
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
            <div className="p-6 sm:p-8 rounded-card border-2 border-ink bg-card shadow-card">
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="text-center space-y-2">
                  <StickerBadge variant="sun" size="sm">Deliverable 06</StickerBadge>
                  <h3 className="font-display font-extrabold text-2xl text-ink tracking-tight">
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
        <section className="py-20 sm:py-24 px-4 border-b-2 border-ink bg-dots">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <StickerBadge variant="sun">Target audience</StickerBadge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                Who it&apos;s for
              </h2>
              <p className="text-sm text-ink-muted">
                From interview prep to CI automation: built for anyone reading code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Students — wide tile */}
              <div className="md:col-span-7 rounded-card border-2 border-ink bg-card p-6 sm:p-8 shadow-card flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-sun flex items-center justify-center shadow-card-sm">
                    <GraduationCap className="w-5 h-5 text-ink" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Students</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Polish your portfolio repos before placements. Turn vague project directories
                    into production-ready showcases with tests, licenses, and architecture docs.
                  </p>
                </div>
                <div className="p-3 rounded-control border-2 border-ink bg-paper-2 text-xs font-mono text-ink">
                  &ldquo;Took my portfolio repo from 62 to 91 in one weekend.&rdquo;
                  <span className="ml-2 text-ink-muted">(sample)</span>
                </div>
              </div>

              {/* Open-source newcomers */}
              <div className="md:col-span-5 rounded-card border-2 border-ink bg-card p-6 sm:p-8 shadow-card flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-sky flex items-center justify-center shadow-card-sm">
                    <Compass className="w-5 h-5 text-ink" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Open-source newcomers</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Understand a new codebase in minutes before opening your first pull request.
                  </p>
                </div>
                <div className="p-2.5 rounded-control border-2 border-ink bg-lime inline-block w-fit">
                  <span className="text-xs font-mono font-bold text-ink">
                    Instant visual navigation →
                  </span>
                </div>
              </div>

              {/* Recruiters */}
              <div className="md:col-span-5 rounded-card border-2 border-ink bg-card p-6 sm:p-8 shadow-card flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-lime flex items-center justify-center shadow-card-sm">
                    <Briefcase className="w-5 h-5 text-ink" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Recruiters &amp; leads</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Judge a repo in 30 seconds. Verify genuine engineering hygiene, CI test coverage,
                    and documentation.
                  </p>
                </div>
                <div className="p-2.5 rounded-control border-2 border-ink bg-paper-2 inline-block w-fit text-xs font-mono font-bold text-ink">
                  0–100 objective score benchmarks
                </div>
              </div>

              {/* Maintainers — wide tile */}
              <div className="md:col-span-7 rounded-card border-2 border-ink bg-card p-6 sm:p-8 shadow-card flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-control border-2 border-ink bg-primary flex items-center justify-center shadow-card-sm">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">Maintainers</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">
                    Fail CI when repository health drops. Run{' '}
                    <code className="font-mono">npx repometric --min-score 80</code> in GitHub
                    Actions to stop hygiene rot.
                  </p>
                </div>
                <div className="font-mono text-xs bg-ink text-white p-3 rounded-control border-2 border-ink">
                  repometric --min-score 85 --json
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 1.6 What we check ─── */}
        <section className="py-20 px-4 border-b-2 border-ink bg-paper">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <h2 className="font-display font-extrabold text-3xl text-ink tracking-tight">
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
                  icon: <Activity className="w-5 h-5 text-ink" />,
                  bg: 'bg-primary',
                },
                {
                  label: 'Maintenance',
                  desc: 'Issue resolution',
                  icon: <GitPullRequest className="w-5 h-5 text-ink" />,
                  bg: 'bg-sky',
                },
                {
                  label: 'Community',
                  desc: 'Governance & code',
                  icon: <Users className="w-5 h-5 text-ink" />,
                  bg: 'bg-lime',
                },
                {
                  label: 'Docs',
                  desc: 'README & license',
                  icon: <FileText className="w-5 h-5 text-ink" />,
                  bg: 'bg-sun',
                },
                {
                  label: 'Hygiene',
                  desc: 'CI & git hygiene',
                  icon: <ShieldCheck className="w-5 h-5 text-ink" />,
                  bg: 'bg-lime',
                },
                {
                  label: 'Dependencies',
                  desc: 'Vulnerabilities',
                  icon: <Boxes className="w-5 h-5 text-white" />,
                  bg: 'bg-coral',
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="p-4 rounded-card border-2 border-ink bg-card shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card transition-all duration-[120ms] text-center space-y-2"
                >
                  <div
                    className={`w-9 h-9 mx-auto rounded-control border-2 border-ink flex items-center justify-center ${c.bg}`}
                  >
                    {c.icon}
                  </div>
                  <div className="font-bold text-xs text-ink">{c.label}</div>
                  <p className="text-[11px] text-ink-muted">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/methodology"
                className="inline-flex items-center gap-1.5 font-bold text-sm text-primary-text border-b-2 border-primary-text hover:opacity-80 transition-opacity"
              >
                <span>See every check and arithmetic rule</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 1.7 Try a real repo (gallery) ─── */}
        <section className="py-20 sm:py-24 px-4 border-b-2 border-ink bg-dots">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <StickerBadge variant="sun">Sample gallery</StickerBadge>
                <h2 className="font-display font-extrabold text-3xl text-ink tracking-tight">
                  Try a pre-analyzed repo
                </h2>
                <p className="text-sm text-ink-muted">
                  Click any card to open its instant report page with full visualizers.
                </p>
              </div>
              <StickerBadge variant="paper" size="sm" dot={false}>
                Sample preview benchmarks
              </StickerBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {[
                {
                  owner: 'facebook',
                  repo: 'react',
                  score: 88,
                  grade: 'Good',
                  variant: 'sky' as const,
                  desc: 'Component library hub',
                },
                {
                  owner: 'expressjs',
                  repo: 'express',
                  score: 78,
                  grade: 'Good',
                  variant: 'sky' as const,
                  desc: 'Fast, unopinionated web framework',
                },
                {
                  owner: 'pallets',
                  repo: 'flask',
                  score: 82,
                  grade: 'Good',
                  variant: 'sky' as const,
                  desc: 'Python micro web framework',
                },
                {
                  owner: 'vercel',
                  repo: 'next.js',
                  score: 91,
                  grade: 'Excellent',
                  variant: 'lime' as const,
                  desc: 'React framework for the web',
                },
                {
                  owner: 'tailwindlabs',
                  repo: 'tailwindcss',
                  score: 85,
                  grade: 'Good',
                  variant: 'sky' as const,
                  desc: 'Utility-first CSS framework',
                },
                {
                  owner: 'torvalds',
                  repo: 'linux',
                  score: 72,
                  grade: 'Needs work',
                  variant: 'sun' as const,
                  desc: 'Linux kernel tree',
                },
              ].map((r) => (
                <Link
                  key={`${r.owner}/${r.repo}`}
                  href={`/r/${r.owner}/${r.repo}`}
                  className="p-5 rounded-card border-2 border-ink bg-card shadow-card hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-card-lg transition-all duration-[120ms] flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-xs font-medium text-ink-muted truncate">
                        {r.owner}/
                      </span>
                      <StickerBadge variant={r.variant} size="sm" rotate="right">
                        {r.grade}
                      </StickerBadge>
                    </div>
                    <div className="font-display font-extrabold text-xl text-ink truncate">
                      {r.repo}
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{r.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t-2 border-ink/10">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-extrabold text-2xl text-ink leading-none">
                        {r.score}
                      </span>
                      <span className="text-[11px] font-mono text-ink-muted">/100</span>
                    </div>
                    <span className="text-xs font-bold text-primary-text flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 1.8 Privacy and trust ─── */}
        <section className="py-20 px-4 border-b-2 border-ink bg-paper">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <h2 className="font-display font-extrabold text-3xl text-ink tracking-tight">
                Privacy &amp; trust
              </h2>
              <p className="text-sm text-ink-muted">
                Transparent by design. You never have to worry about IP leaks or security traps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                {
                  icon: <Eye className="w-5 h-5 text-ink" />,
                  bg: 'bg-lime',
                  title: 'Read-only',
                  body: 'We only request read access to public metadata. No write permissions ever.',
                },
                {
                  icon: <Users className="w-5 h-5 text-ink" />,
                  bg: 'bg-sky',
                  title: 'Public repos only',
                  body: 'No risk of exposing confidential or private proprietary code.',
                },
                {
                  icon: <Lock className="w-5 h-5 text-white" />,
                  bg: 'bg-coral',
                  title: 'We never run code',
                  body: 'Analyzed files are parsed for imports and metadata, never compiled or executed.',
                },
                {
                  icon: <Database className="w-5 h-5 text-ink" />,
                  bg: 'bg-sun',
                  title: 'Scores stored only',
                  body: 'We cache scores, metrics, and import maps. Your raw source is never stored.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-card border-2 border-ink bg-card shadow-card-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-card transition-all duration-[120ms] text-center space-y-3"
                >
                  <div
                    className={`w-11 h-11 mx-auto rounded-control border-2 border-ink flex items-center justify-center shadow-card-sm ${item.bg}`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-display font-bold text-base text-ink">{item.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 1.9 FAQ ─── */}
        <section
          id="faq"
          className="py-20 sm:py-24 px-4 border-b-2 border-ink bg-dots"
        >
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <StickerBadge variant="primary">Frequently asked</StickerBadge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                Frequently asked questions
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>

        {/* ─── 1.10 Final call to action ─── */}
        <section className="py-20 sm:py-28 px-4 bg-paper">
          <div className="max-w-4xl mx-auto rounded-card border-2 border-ink bg-card p-8 sm:p-14 shadow-card-lg flex flex-col items-center text-center space-y-6">
            <Tilly mood="happy" size={72} />
            <div className="space-y-2 max-w-lg">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
                Ready? Paste a repo link.
              </h2>
              <p className="text-sm text-ink-muted">
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

      {/* ─── 1.11 Footer ─── */}
      <footer className="py-10 px-4 bg-paper-2 text-ink text-xs border-t-2 border-ink">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Tilly mood="idle" size={24} />
            <span className="font-display font-bold text-sm tracking-tight text-ink">
              repometric
            </span>
            <span className="text-ink-muted">• Precision code intelligence</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-ink-muted">
            <Link href="/methodology" className="hover:text-ink transition-colors">
              Methodology
            </Link>
            <Link href="/kit" className="hover:text-ink transition-colors">
              Design kit
            </Link>
            <a
              href="https://github.com/Hemacharankodhanda/repometric"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://npmjs.com/package/repometric"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
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
              className="font-medium text-ink underline"
            >
              Hemacharan Kodhanda
            </a>
            . \$0 cost, free tiers, zero AI APIs.
          </div>
        </div>
      </footer>
    </div>
  );
}
