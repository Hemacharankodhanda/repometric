# Decisions

Decisions already made. Do not reopen them without a reason. Add new entries at the bottom as `ADR-0NN` with date, decision and why.

**ADR-001: pnpm monorepo with a shared pure `core`.** The web app and the CLI must produce identical scores, and `core` must run in Node, browsers and workers. One codebase gives two deliverables.

**ADR-002: Next.js on Vercel Hobby with Supabase Postgres.** Free, familiar, and covers SSR for share previews, route handlers and a database. A Cloudflare-only stack was considered and set aside. Mitigations for free-tier limits: caching by `(repo, sha)`, a daily keep-alive cron so the Supabase project does not pause, compact stored data.

**ADR-003: Cache by `(repo, commit SHA)`.** Unchanged repos never re-hit GitHub, which protects the 5,000 requests per hour limit.

**ADR-004: Score on the server, build the graph in a browser Web Worker.** Scoring needs trusted GitHub metadata and must match the badge. Parsing thousands of files is CPU-heavy, so it runs in the visitor's browser and the result is stored for later visitors.

**ADR-005: File contents from `raw.githubusercontent.com`, pinned to the SHA.** Avoids spending REST API quota. Structure comes from one Git Trees call.

**ADR-006: Import-level graph with `es-module-lexer` and a custom Python parser.** Tree-sitter WASM is deferred: it adds bundle size and complexity, and import-level edges are enough for v1. Revisit for function-level graphs.

**ADR-007: Canvas 2D for both visualizers.** SVG and DOM do not hold up at thousands of nodes. D3 is used for layout math only, not for DOM manipulation.

**ADR-008: P0 map color modes are language, size, import fan-in and test sibling.** Churn and top-author need per-file commit history, which is expensive on the GitHub API. They are P1 and computed only for the 100 largest source files with batched GraphQL.

**ADR-009: No AI or LLM API in this project.** Scoring must be deterministic, explainable and free. AI features belong to the separate PR reviewer project.

**ADR-010: Public repos only in v1.** Avoids OAuth scope handling and storing anything private.

**ADR-011: Scores for repos with no issue or PR history use `no_data` at 50%.** Fairness for small student repos without penalizing or rewarding the absence of data.

**ADR-012: Architecture diagram tab using Mermaid and linkStyle cyclic highlighting.** Visualizes system components and circular dependencies.

**ADR-013: Refreshed field guide design tokens for modern contrast and vibrancy.** Updated `--paper` to a clean warm paper tone (`#FAF9F5`), elevated `--primary` to electric indigo (`#4F46E5`), sharpened obsidian slate ink (`#0F172A`), enhanced accents (spring lime `#A3E635`, warm amber `#F59E0B`, coral `#F43F5E`, azure sky `#38BDF8`), and upgraded dark mode with deep midnight obsidian (`#090D16`) for superior contrast and readability.

**ADR-014: Modern Dev-Intelligence UI/UX Architecture.** Replaced the cartoon/neo-brutalist aesthetic with a high-precision developer-intelligence design system inspired by Linear, Vercel/Geist, and GitHub Next.

**ADR-015: Complete UI Paradigm Shift to High-End Interactive Developer Intelligence with Motion Animations.** Shifted the UI factor completely from the playful cartoon style to a modern, high-precision engineering platform look (Linear/Vercel/Raycast grade). Introduces refined borders, multi-layered elevation, ambient luminous glows, frosted glass toolbars, and rich `motion/react` (Framer Motion) micro-interactions, layout transitions, and entrance animations, with strict reduced-motion accessibility support.


