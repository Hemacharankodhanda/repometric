# Repo Analyzer: agent guide

Read this file first, then `docs/PRD.md`, then the spec for the task you are working on.

## What this project is
Repo Analyzer takes a public GitHub repository and produces:
1. A 0-100 health score with evidence for every deduction and a prioritized fix list.
2. A **Repo Map**: a zoomable treemap of folders and files.
3. A **Dependency Graph**: a force-directed graph of file imports.

A Next.js web app and an npm CLI share one `core` package. The visualizers are a must-have, flagship feature.

## Hard constraints
- **$0 cost.** Free tiers only: Vercel Hobby, Supabase free, GitHub API, npm, GitHub Actions. Never add a paid service or one that needs a credit card.
- **No AI/LLM API** anywhere in this project. Scoring is deterministic rules and arithmetic.
- **Public repos only** in v1.
- **Never execute analyzed code.** Treat every repo-derived string (names, paths, README text, commit messages) as untrusted. Escape on render. Never use `dangerouslySetInnerHTML` with it.
- **Secrets stay server-side.** `GITHUB_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` must never appear in client code or in any `NEXT_PUBLIC_*` variable. Never commit `.env` files.

## Stack
TypeScript (strict) everywhere, pnpm workspaces, Next.js App Router, Tailwind, shadcn/ui (Radix), Supabase Postgres, D3 (`d3-hierarchy`, `d3-force`, `d3-zoom`, `d3-scale`, `d3-quadtree`) drawing on Canvas, `es-module-lexer` for JS/TS imports, a custom Python import parser, Commander for the CLI, Zod for validation, Zustand for UI state, Vitest, Playwright, MSW for mocking network in tests.

## Layout
```
apps/web/           Next.js app (routes, UI, API route handlers)
packages/core/      Pure TypeScript: scoring, parsers, graph builder, GitHub client. No UI.
packages/viz/       Canvas components: RepoMap, DependencyGraph, shared stores
packages/cli/       npm CLI, depends on core
supabase/migrations SQL migrations
docs/               Specs (see below)
```

## Commands
```
pnpm install
pnpm dev                 # web app
pnpm test                # all unit tests
pnpm --filter @repo-analyzer/core test
pnpm lint && pnpm typecheck
pnpm build
pnpm e2e                 # Playwright
pnpm db:types            # regenerate Supabase types
```

## How to work
1. Pick the next unchecked task in `docs/ROADMAP.md`. Do tasks in order, one at a time.
2. Before writing code, state a plan in 3-6 lines. Ask a question only if a spec is ambiguous or contradicts another; otherwise choose the simplest option and record it in `docs/DECISIONS.md`.
3. **Specs win over assumptions.** Scoring: `docs/SCORING_SPEC.md`. API and CLI: `docs/API_SPEC.md`. Visualizers: `docs/VISUALIZER_SPEC.md`. Data: `docs/DATA_MODEL.md`. UI look: `docs/DESIGN_SYSTEM.md`. If you must deviate, update the spec in the same change and say why.
4. When a task's acceptance criteria pass, tick its checkbox in `ROADMAP.md`.

## Code rules
- `packages/core` is pure and portable: it must run in Node, the browser and web workers. No `fs`, no global `fetch` inside scoring or parsing; data enters through the interfaces in `docs/ARCHITECTURE.md` (`RepoSnapshot`, `RepoDataSource`). Time is passed in (`now`), never read from `Date.now()` inside scoring.
- No `any`. Prefer small pure functions. Keep files under about 300 lines.
- Every scoring signal and parser branch has unit tests built on fixtures. No network in unit tests.
- UI uses tokens from `docs/DESIGN_SYSTEM.md`. No hard-coded hex colors in components. Use sentence case and plain-language copy.
- Add a dependency only when needed and prefer the stack above. For anything shipped to the browser, check bundle size. Visualizers are lazy-loaded.
- Commits follow Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), one logical change each.
- API errors use `{ "error": { "code", "message" } }`. UI error text says what went wrong and how to fix it.

## Definition of done (every task)
- `pnpm typecheck`, `pnpm lint` and `pnpm test` pass.
- New logic has tests; fixtures are committed.
- Keyboard use, visible focus and labels work for any new UI.
- No console errors or warnings in the browser.
- Specs and docs are updated if behavior changed.
- The task's checkbox in `docs/ROADMAP.md` is ticked.

## Performance budgets
- Report in under 10 s (p50) for repos up to 1,000 files.
- Visualizers hold 60 fps up to 2,000 graph nodes and 5,000 map tiles. Hard cap of 5,000 graph nodes, above which the graph collapses to folder level.
- Landing page first-load JS under 150 KB gzipped.

## Docs index
| File | Use it for |
|---|---|
| `docs/PRD.md` | What and why |
| `docs/ARCHITECTURE.md` | Packages, data flow, TypeScript contracts |
| `docs/SCORING_SPEC.md` | Exact scoring rules and fix list |
| `docs/DATA_MODEL.md` | Tables and policies (SQL in `supabase/migrations`) |
| `docs/API_SPEC.md` | HTTP endpoints, errors, CLI |
| `docs/VISUALIZER_SPEC.md` | Repo Map and Dependency Graph |
| `docs/DESIGN_SYSTEM.md` | Look, tokens, copy, accessibility |
| `docs/ROADMAP.md` | Ordered tasks with acceptance criteria |
| `docs/DECISIONS.md` | Decisions already made and why |
| `docs/SETUP.md` | Accounts, env vars, deploy |
