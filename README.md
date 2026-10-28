# RepoMetric

[![CI](https://github.com/Hemacharankodhanda/repometric/actions/workflows/ci.yml/badge.svg)](https://github.com/Hemacharankodhanda/repometric/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js)](https://nextjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange?logo=pnpm)](https://pnpm.io/)
[![Zero AI](https://img.shields.io/badge/Scoring-Deterministic_(0%20AI)-emerald.svg)](#scoring-methodology)

> **Deterministic 0–100 health scoring, zoomable treemap repo maps, interactive dependency graphs, and live architecture visualizers for any public GitHub repository.**

---

## Overview

RepoMetric turns any public GitHub repository URL into an actionable, visual diagnostic report in seconds. It provides:

1. **0–100 Health Score**: Fully transparent, reproducible arithmetic evaluating repository vitality across 6 core categories with evidence for every deduction.
2. **Prioritized Fix Engine**: A ranked to-do list with quantified point improvements (e.g. `+6.0 Add a CI workflow`) and effort tags (S/M/L) to reach your projected score.
3. **Interactive Repo Map**: A hardware-accelerated Canvas treemap visualizing file and directory proportions with instant drill-down and language color modes.
4. **Force-Directed Dependency Graph**: A dynamic import graph revealing architectural hubs, orphans, fan-in/fan-out hotspots, and dependency cycles (via Tarjan's algorithm).
5. **Architecture Diagram**: Auto-generated Mermaid component architecture showing key subsystems and external dependencies.
6. **Live README Badges**: Crisp SVG status badges (`/badge/:owner/:repo.svg`) that display live repo health grades.
7. **Production CLI**: Run audits directly in terminal or as a CI threshold gate with `--min-score`.

---

## Flagship Features

### 1. Deterministic Scoring Engine (No AI / LLMs)
Every score is computed strictly using reproducible mathematical formulas defined in the specification. Zero LLM hallucinations, zero API token costs, and 100% auditability.

| Category | Weight | Signals Evaluated |
|---|---|---|
| **Activity** | 20% | Commit frequency, recent commit freshness, release cadence |
| **Maintenance** | 20% | Issue closure rate, PR merge velocity, open issue backlogs |
| **Community** | 15% | Contributor diversity, GitHub Discussions, issue/PR templates |
| **Documentation** | 20% | README completeness, license validity, CONTRIBUTING guides, code examples |
| **Hygiene** | 15% | CI workflows, automated test suites, `.gitignore`, secret leak protections |
| **Dependencies** | 10% | Outdated dependencies, deprecated package warnings, manifest health |

### 2. High-Performance Canvas Visualizers
- **Repo Map**: Squarified treemap layout implemented on HTML5 Canvas holding smooth 60 fps for repositories with up to 5,000 files.
- **Dependency Graph**: D3 force simulation with cluster constraints, interactive hover highlighting, depth filters, and cycle identification.

---

## Monorepo Architecture

```
repometric/
├── apps/
│   └── web/              # Next.js 14 App Router, Tailwind CSS, shadcn/ui, API routes
├── packages/
│   ├── core/             # Pure TypeScript: scoring engine, GitHub client, parsers, graph builder
│   ├── viz/              # Canvas visualizers: RepoMap, DependencyGraph, ArchitectureDiagram
│   └── cli/              # Terminal CLI binary (`repometric`) powered by Commander
├── supabase/
│   └── migrations/       # SQL migrations (Postgres schema, RLS policies, hit counters)
├── docs/                 # Complete specifications (Architecture, Scoring, Visualizers, UX)
└── .github/workflows/    # Automated CI verification workflow
```

---

## Quick Start (Local Development)

You can run RepoMetric locally in under 3 minutes:

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or later
- [pnpm](https://pnpm.io/) v9 or later (`npm install -g pnpm`)

### 1. Clone & Install
```bash
git clone https://github.com/Hemacharankodhanda/repometric.git
cd repometric
pnpm install
```

### 2. Configure Environment (Optional)
RepoMetric runs out of the box with zero external configuration using built-in mock fallbacks. To connect real GitHub API queries and persistent storage:

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```env
# GitHub Personal Access Token (raises rate limit from 60 to 5,000 req/hr)
GITHUB_TOKEN=ghp_your_token_here

# Supabase (optional for database persistence & cache)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Web URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## CLI Usage

Analyze repositories right from your terminal:

```bash
# Analyze a GitHub repository
pnpm repometric facebook/react

# Fail CI if score is below threshold
pnpm repometric expressjs/express --min-score 80

# Output machine-readable JSON
pnpm repometric vercel/next.js --json

# Open web report in default browser
pnpm repometric tailwindlabs/tailwindcss --open
```

Sample CLI output:
```
owner/repo  82/100  Good   (projected 94 after fixes)

Activity         18/20
Maintenance      16/20
Community        12/15
Documentation    16/20
Hygiene          12/15
Dependencies      8/10

Top fixes
  +4.0  Add a CONTRIBUTING.md guide       (S)
  +6.0  Add test coverage reporting       (M)
  +2.0  Update 2 deprecated dependencies  (S)
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Initiates repository scoring & snapshot analysis |
| `GET` | `/api/report/:owner/:repo` | Retrieves latest cached analysis report |
| `POST` | `/api/graph` | Persists parsed dependency graph data (capped at 5,000 nodes) |
| `GET` | `/api/graph/:analysisId` | Retrieves stored dependency graph |
| `GET` | `/badge/:owner/:repo.svg` | Returns dynamic SVG badge colored by grade (`flat` or `flat-square`) |
| `GET` | `/api/cron/keepalive` | Daily keepalive cron for Supabase free-tier persistence |

### README Badge Integration
Embed your repository's live health grade directly in your markdown:

```markdown
[![RepoMetric](https://repometric.dev/badge/owner/repo.svg)](https://repometric.dev/r/owner/repo)
```

---

## Verification & Testing

RepoMetric maintains strict test coverage and static analysis:

```bash
# Run all unit and integration tests (Vitest)
pnpm test

# Run TypeScript typechecks across all monorepo packages
pnpm typecheck

# Run ESLint validation
pnpm lint

# Production monorepo build (Next.js, Core, Viz, CLI)
pnpm build

# Run end-to-end tests (Playwright)
pnpm e2e
```

---

## Design Principles & Hard Constraints

- **$0 Infrastructure Cost**: Built exclusively for free tiers (Vercel Hobby, Supabase free, GitHub public API, npm).
- **Strict Client-Server Isolation**: Server credentials (`GITHUB_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) are guarded with `import 'server-only'` and strict ESLint import boundary rules.
- **Untrusted Code Execution Guarantee**: Analyzed repository contents are treated as data only. Code is parsed with static AST lexical analysis (`es-module-lexer`), never executed or evaluated.
- **Accessible & Responsive**: WCAG AA contrast standards, keyboard navigable Canvas controls, and mobile responsive layouts down to 375 px.

---

## License

This project is licensed under the [MIT License](./LICENSE) © 2026 [Hemacharan Kodhanda](https://github.com/Hemacharankodhanda).
