# Kickoff prompt

Paste this into your AI coding agent after placing this folder's contents at the root of a new empty GitHub repo.

---

You are building **RepoMetric** in this repository. Before writing any code:

1. Read `AGENTS.md` fully, then `docs/PRD.md`, `docs/ARCHITECTURE.md` and `docs/DECISIONS.md`.
2. Skim `docs/SCORING_SPEC.md`, `docs/API_SPEC.md`, `docs/VISUALIZER_SPEC.md`, `docs/DATA_MODEL.md`, `docs/DESIGN_SYSTEM.md` and `docs/UX_SPEC.md` so you know where each answer lives.
3. Open `docs/ROADMAP.md` and start with the first unchecked task (T0.1).

For each task:
- Write a plan in 3-6 lines first, then implement.
- Follow the specs exactly. If a spec is ambiguous or contradicts another, ask me one short question; otherwise pick the simplest option and log it in `docs/DECISIONS.md`.
- Write tests as you go. Run `pnpm typecheck`, `pnpm lint` and `pnpm test` before declaring the task done.
- When the acceptance criteria pass, tick the checkbox in `docs/ROADMAP.md`, commit with a Conventional Commit message, and tell me what to verify manually.

Hard constraints: everything must run at $0 on free tiers, no AI/LLM APIs, public repos only, never execute analyzed code, secrets stay server-side.

Start with T0.1 now.
