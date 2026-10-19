# Data model (Supabase Postgres)

The SQL lives in `supabase/migrations/0001_init.sql`. This file explains it. Change the schema only by adding a new numbered migration.

## Tables
| Table | Purpose | Key |
|---|---|---|
| `repos` | One row per GitHub repo. `owner` and `name` stored lowercase | `id`, unique `(owner, name)` |
| `analyses` | One scored analysis per commit | `id`, unique `(repo_id, commit_sha)` |
| `graphs` | Dependency graph JSON for one analysis | `analysis_id` |
| `badge_hits` | Daily badge view counter (counted on edge cache misses, so approximate) | `(repo_id, day)` |
| `rate_state` | Token bucket per key (for example `analyze:<ip>`) | `key` |

## JSON columns
- `analyses.category_scores` is `CategoryResult[]` (see `ARCHITECTURE.md`), including per-signal evidence.
- `analyses.fixes` is `Fix[]`.
- `graphs.nodes` is `GraphNode[]`, `graphs.edges` is `GraphEdge[]`, `graphs.stats` is `GraphData['stats']`.
- The repo metadata shown on the report page is re-read from `repos` plus the cached report; do not duplicate large blobs.

## Access rules
- Public clients (anon key) can only `select` from `repos`, `analyses` and `graphs`.
- All inserts and updates go through Next.js route handlers using the service role key.
- `badge_hits` and `rate_state` have RLS enabled with no policies: service role only.
- `increment_badge_hit(repo_id)` is a security-definer function callable only by the service role.

## Rules
- Never store source code or file contents. Store derived metrics and import edges only.
- Keep the free tier small: one `analyses` row per `(repo, sha)`, one `graphs` row per analysis. Optional cleanup: delete analyses older than 90 days that are not the latest for their repo.
- Normalize `owner` and `name` to lowercase before any query.
- A daily Vercel Cron hits `/api/cron/keepalive`, which runs a trivial query so the free project does not pause.

## Typical queries
```sql
-- Latest analysis for a repo (permalink and badge)
select a.* from analyses a join repos r on r.id = a.repo_id
where r.owner = $1 and r.name = $2
order by a.created_at desc limit 1;

-- Cache lookup during /api/analyze
select * from analyses where repo_id = $1 and commit_sha = $2;
```
