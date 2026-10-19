# Repo Analyzer: product requirements (condensed)

Status: v1 draft. Target: MVP in 4 weeks at $0 infrastructure cost.

## 1. Overview
Paste a public GitHub repo URL (or run the CLI) and get a 0-100 health score, a prioritized fix list, a shareable README badge, and two visualizers: a **Repo Map** (zoomable treemap) and a **Dependency Graph** (force-directed import graph). The web app and the npm CLI share one `core` package.

## 2. Problem
- Students and juniors don't know what makes a repo look professional, so portfolio repos lose out to weaker but better-presented ones.
- Developers joining an unfamiliar codebase can't see its shape: size, coupling, hot spots.
- Existing tools either score without explaining (badges) or visualize without judging (graph tools). None combines both free, in the browser.

## 3. Goals
1. Actionable health score for any public repo in under 15 s for typical repos.
2. Let users **see** a repo through the Map and Graph, built from real code.
3. An ordered fix list so the score leads to action.
4. A CLI and a badge for distribution and measurable usage.
5. Run at $0 on Vercel, Supabase, the GitHub API and npm.

### Non-goals (v1)
Private repos, type-aware call graphs, paid plans, org dashboards, dependency graphs for languages other than JS/TS and Python (the Map and score work for any language).

## 4. Personas
| Persona | Need | Use |
|---|---|---|
| Student builder (primary) | Make portfolio repos look strong | Score, fix list, badge |
| Open-source contributor | Understand an unfamiliar repo fast | Map and Graph |
| Recruiter or reviewer | Judge a repo in seconds | Paste a link, read score and map |
| Maintainer | Track health | CLI in CI with `--min-score` |

## 5. Features
P0 = must ship in MVP. P1 = should. P2 = later.

| # | Feature | Pri | Spec |
|---|---|---|---|
| F1 | Repo input (URL, `owner/repo`) and GitHub fetching with clear errors | P0 | API_SPEC |
| F2 | Health score engine, six weighted categories, evidence per deduction | P0 | SCORING_SPEC |
| F3 | Fix list ordered by points gained per effort, projected score | P0 | SCORING_SPEC |
| F4 | **Repo Map** (treemap, zoom, hover card, search, legend, color modes) | P0 | VISUALIZER_SPEC |
| F5 | **Dependency Graph** (force layout, neighborhood focus, cycles, insights) | P0 | VISUALIZER_SPEC |
| F6 | Linked selection across Map and Graph, shareable view URL | P0 | VISUALIZER_SPEC |
| F7 | Report page with tabs Report / Map / Graph, permalink `/r/owner/repo` | P0 | API_SPEC |
| F8 | SVG badge endpoint and copy-paste snippets | P0 | API_SPEC |
| F9 | npm CLI sharing `core`, `--json`, `--min-score`, local path mode | P1 | API_SPEC |
| F10 | Exports: JSON, Markdown report, PNG of visualizers | P1 | VISUALIZER_SPEC |
| F11 | Churn and top-author color modes on the Map | P1 | VISUALIZER_SPEC |
| F12 | Compare two repos, score history | P2 | n/a |

Score categories and weights: Activity 20, Maintenance 20, Community and bus factor 15, Documentation 20, Engineering hygiene 15, Dependencies 10. Grade bands: 90+ Excellent, 75-89 Good, 55-74 Needs work, below 55 At risk. Every deduction must link to visible evidence.

## 6. Non-functional requirements
| Area | Requirement |
|---|---|
| Performance | Report in under 15 s up to 1,000 files; 60 fps interactions up to 2,000 graph nodes |
| Caching | Results keyed by `(repo, commit SHA)`; unchanged repos never re-hit GitHub |
| Reliability | On GitHub rate limit, serve cached results and a clear message |
| Security | Never execute analyzed code; sanitize all repo-derived strings; secrets server-side only |
| Accessibility | Keyboard navigation in visualizers, color-blind-safe palettes, a table alternative per graph |
| Responsive | Report works on mobile; visualizers support touch and pinch |
| Privacy | Store only derived metrics and import edges, never source code |

## 7. Success metrics (first 60 days)
500+ repos analyzed, 150+ unique users, 25+ badges in public READMEs, 100+ weekly npm downloads, 50+ GitHub stars, median report time under 10 s, 60%+ of sessions open the Map or Graph tab. Instrument these from day one.

## 8. Risks
| Risk | Mitigation |
|---|---|
| GitHub rate limits | SHA cache, conditional requests (ETag), optional user token, `raw.githubusercontent.com` for file contents |
| Huge repos make graphs unreadable | Node cap, folder collapse mode, Canvas rendering, filters |
| Import resolution is imperfect | Resolve tsconfig paths, show an "unresolved" count, label the graph "import-level" |
| Score feels arbitrary | Transparent weights, evidence per signal, methodology page |
| Free-tier limits and Supabase pausing | Edge caching, daily keep-alive cron, compact stored data |
| Scope creep in visualizers | Two views only in MVP, fixed layouts, no 3D or time-lapse |

## 9. Post-MVP ideas
Private repos via OAuth, time-lapse of repo growth, function-level call graphs, a GitHub App that comments score changes on PRs, embeddable map widget.
