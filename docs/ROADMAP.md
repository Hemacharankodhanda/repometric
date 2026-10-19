# Roadmap

Work top to bottom, one task at a time. Tick the box only when the acceptance criteria (AC) pass and the definition of done in `AGENTS.md` is met. Priorities: P0 must ship, P1 should, P2 later. If time runs short, cut P1 and P2 first; the score engine and the visualizers are protected scope.

## Phase 0: bootstrap (days 1-2)
- [ ] **T0.1 Monorepo scaffold.** pnpm workspaces with `apps/web` (Next.js App Router, Tailwind), `packages/core`, `packages/viz`, `packages/cli`. Shared `tsconfig.base.json` (strict), ESLint, Prettier, Vitest.
  AC: `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass on a clean clone.
- [ ] **T0.2 CI.** Keep `.github/workflows/ci.yml` working. AC: CI is green on a pull request.
- [ ] **T0.3 Supabase wiring.** Apply `0001_init.sql`, add `pnpm db:types`, create a server-only Supabase client helper in `apps/web/src/server/db.ts` that uses the service role key.
  AC: a script inserts and reads one `repos` row; the service key is not importable from client code (add an ESLint restriction or a `server-only` import).
- [x] **T0.4 Design tokens.** Wire `tokens.css` into Tailwind, load the three fonts with `next/font`, add a light/dark toggle.
  AC: a demo page shows every token in both themes; contrast of text tokens verified at 4.5:1 or better.

## Phase 1: core scoring (week 1)
- [x] **T1.1 Contracts.** Create `packages/core/src/types.ts` exactly as in `ARCHITECTURE.md`. AC: exported from the package index; typecheck passes.
- [ ] **T1.2 GitHub client.** Implement the REST and GraphQL client producing a `RepoSnapshot`, with ETag support, rate-limit handling and typed errors (`ARCHITECTURE.md` section 6).
  AC: unit tests with MSW cover success, 404, private repo, rate limit and truncated tree.
- [ ] **T1.3 Scoring framework.** Config file, `Signal` interface, normalization and grading from `SCORING_SPEC.md` section 1.
  AC: tests for `na`, `no_data` and renormalization when a category is excluded.
- [ ] **T1.4 Activity signals.** AC: every boundary in the spec has a test.
- [ ] **T1.5 Documentation signals.** AC: README heading and fence heuristics tested against sample READMEs; the under-300-characters cap tested.
- [ ] **T1.6 Hygiene signals.** AC: path-matching tests including the `.env.example` exception.
- [ ] **T1.7 Fix list.** Generate fixes, priorities and projected score per spec section 3.
  AC: golden snapshot tests for `strong-repo`, `student-repo`, `abandoned-repo`, `solo-minimal`, `no-manifest`; property tests pass.

## Phase 2: remaining scoring, API and report UI (week 2)
- [ ] **T2.1 Maintenance signals** and **T2.2 Community signals.** AC: tests per boundary; bot and owner exclusion tested.
- [ ] **T2.3 Dependency signals.** Manifest parsing for `package.json` and `requirements.txt`/`pyproject.toml`; npm and PyPI lookups with concurrency 8.
  AC: range-to-major parsing tested; deprecated flag read from the registry response; `na` when no manifest.
- [ ] **T2.4 Persistence and `POST /api/analyze`.** Cache by `(repo, sha)`, rate limiting through `rate_state`, error mapping from `API_SPEC.md`.
  AC: second call for the same SHA makes zero GitHub calls (asserted in a test); each error code returns the specified HTTP status.
- [ ] **T2.5 Report page UI.** Score rail, ranked category legend with expandable evidence, fix list, loading and error states, all per `DESIGN_SYSTEM.md`.
  AC: works at 375 px width; keyboard-only use possible; Playwright test analyzes a mocked repo end to end.
- [ ] **T2.6 Permalink and metadata.** `/r/[owner]/[repo]` server-rendered from the stored analysis, Open Graph tags with score and grade, `/methodology` page generated from the scoring config.
  AC: link preview shows the score; methodology lists every signal and weight.

## Phase 3: visualizers (week 3, flagship)
- [ ] **T3.1 Hierarchy and Repo Map renderer.** `buildHierarchy`, squarified treemap on Canvas, folder zoom with breadcrumbs, hover card, legend, language and size color modes, search.
  AC: 5,000 tiles pan at 60 fps on a mid laptop (record in the PR); labels follow the size rules in the spec.
- [ ] **T3.2 JS/TS import parser and resolver.** `es-module-lexer`, extension and index resolution, tsconfig `paths`.
  AC: fixtures for relative, parent, alias, index, dynamic and re-export imports.
- [ ] **T3.3 Python import parser and resolver.** AC: fixtures for absolute, relative and package imports.
- [ ] **T3.4 Graph builder.** Nodes, edges, fan-in and fan-out, cycles (Tarjan), orphans, collapse-to-folders, caps and `truncated`.
  AC: tests for a known cyclic fixture and for the 2,000-node collapse threshold.
- [ ] **T3.5 Dependency Graph renderer.** Force layout, cluster force, hover dimming, neighborhood focus with depth slider, filters, insights panel.
  AC: 2,000 nodes at 60 fps during interaction; cycles render in the danger color.
- [ ] **T3.6 Linked selection and URL state.** Zustand store, side panel, URL parameters, remaining P0 color modes (fan-in, test sibling with hatch pattern).
  AC: Playwright test: select a file on the Map, see it highlighted in the Graph, reload and the view is restored.
- [ ] **T3.7 Worker pipeline and graph persistence.** Web Worker fetches files from `raw.githubusercontent.com` pinned to the SHA, parses, builds, posts progress, then `POST /api/graph`; later visits load `GET /api/graph/[id]`.
  AC: progress bar works; a second visit loads the graph without refetching files.
- [ ] **T3.8 Accessibility for visualizers.** Keyboard navigation, table views, live region, reduced motion.
  AC: every interaction in `VISUALIZER_SPEC.md` section 4 works without a mouse.

## Phase 4: distribution and polish (week 4)
- [ ] **T4.1 Badge endpoint** and copy snippets in the UI. AC: correct SVG per grade, grey badge for unknown repos, cache headers set, hit counter increments on miss.
- [ ] **T4.2 CLI (P1).** `repometric` with `--json`, `--min-score`, `--token`, `--open`, local path mode and exit codes from `API_SPEC.md`.
  AC: tested against a fixture repo; `npx` smoke test in CI; published with a README.
- [ ] **T4.3 Exports (P1).** JSON report, Markdown report, PNG of each visualizer with legend and footer.
- [ ] **T4.4 Keep-alive cron and analytics.** `vercel.json` cron for `/api/cron/keepalive`; privacy-friendly page analytics; capture the success metrics in `PRD.md` section 7.
- [ ] **T4.5 Churn and top-author modes (P1).** Batched GraphQL `history(path:)` for the 100 largest source files.
- [ ] **T4.6 Launch kit.** README with architecture diagram, screenshots (light and dark), live demo link, "design decisions" section; analyze 10 well-known repos for the demo gallery.
  AC: a stranger can run the app locally from the README in under 10 minutes.
- [ ] **T4.7 Polish pass.** Lighthouse accessibility 95 or higher, no console errors, empty and error states reviewed, copy reviewed against `DESIGN_SYSTEM.md` section 7.

## Later (P2)
Compare two repos, score history chart, hierarchical and radial graph layouts, SVG export of the Map, private repos with OAuth.
