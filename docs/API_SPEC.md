# API and CLI specification

All endpoints are Next.js route handlers under `apps/web/src/app`. Validate inputs with Zod. Errors always use:
```json
{ "error": { "code": "RATE_LIMITED", "message": "GitHub rate limit reached. Try again in 12 minutes." } }
```

## Error codes
| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_REPO` | 400 | Input is not `owner/repo` or a github.com URL |
| `NOT_FOUND` | 404 | Repo does not exist |
| `PRIVATE_REPO` | 403 | Repo is private or needs auth (v1 supports public only) |
| `RATE_LIMITED` | 429 | GitHub or our own limiter. Include `Retry-After` |
| `TOO_LARGE` | 413 | Payload or repo beyond limits |
| `UPSTREAM_ERROR` | 502 | GitHub, npm or PyPI failed |
| `INTERNAL` | 500 | Anything else. Never leak stack traces |

## Endpoints

### `POST /api/analyze`
Request: `{ "repo": "owner/name" }` (also accepts `https://github.com/owner/name`, with or without `.git`, branch or path suffixes).

Steps: normalize, fetch repo meta (maps 404 and private to errors), read head SHA of the default branch, look up `(repo, sha)`. On hit return it. On miss build a `RepoSnapshot`, run `scoreSnapshot`, store, return.

Response 200:
```json
{
  "cached": false,
  "analysis": { "id": "uuid", "...AnalysisReport": "..." },
  "graph": { "status": "ready" | "missing" | "unsupported" },
  "files": [ { "path": "src/a.ts", "size": 1200, "language": "TypeScript", "isTest": false } ]
}
```
`files` is included only when `graph.status` is `"missing"`, so the browser worker knows what to fetch. `unsupported` means the repo has no JS/TS or Python files, or more than 20,000 files. The Repo Map still works from the file list in that case, so include `files` for `unsupported` too, but cap at 20,000 entries.

Limits: `maxDuration = 60`. Rate limit 20 requests per hour per IP via `rate_state`.

### `GET /api/report/[owner]/[repo]`
Returns the latest stored analysis without computing anything. 404 if never analyzed. Used by the permalink page for server rendering and Open Graph tags.

### `POST /api/graph`
Request: `{ "analysisId": "uuid", "graph": GraphData }`. Validate with Zod. Reject over 4 MB or more than 5,000 nodes (`TOO_LARGE`). Accept only if the analysis exists and has no graph yet; otherwise return 200 with `{ "stored": false }` (idempotent). Rate limit 60 per hour per IP.

### `GET /api/graph/[analysisId]`
Returns `GraphData`. Header `Cache-Control: public, max-age=31536000, immutable` (the id is immutable).

### `GET /badge/[owner]/[repo].svg`
Query: `style=flat` (default) or `flat-square`. Returns an SVG with label `repo health` and value `82/100`, colored by grade (use the status colors from `DESIGN_SYSTEM.md`). Unknown repo returns a grey `not analyzed` badge with status 200. Header `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`. On a cache miss call `increment_badge_hit`.

### `GET /api/cron/keepalive`
Requires `Authorization: Bearer $CRON_SECRET`. Runs `select 1` against Supabase. Scheduled daily in `vercel.json`.

## GitHub client behavior (in `core`)
- REST for repo meta, commits, releases, tags, contributors, issues and PRs. GraphQL to batch several lookups per request where it reduces calls.
- Send `If-None-Match` with stored ETags when available.
- File structure via the Git Trees API (recursive, one call). File contents via `https://raw.githubusercontent.com/{owner}/{repo}/{sha}/{path}` so they do not consume REST quota.
- Respect `x-ratelimit-remaining`; on exhaustion throw `RateLimitError(resetAt)`.
- If the tree response is truncated, set `graph.status = "unsupported"` and still score.
- Registry lookups: `https://registry.npmjs.org/{name}` and `https://pypi.org/pypi/{name}/json`, concurrency 8, cache results in memory per request.

## Web routes (pages)
| Route | Purpose |
|---|---|
| `/` | URL input and a live example map |
| `/r/[owner]/[repo]` | Report page with tabs Report, Map, Graph. Server renders from stored analysis, triggers analysis if missing. Includes Open Graph tags (score and grade) |
| `/methodology` | Plain-language explanation of every signal, generated from the scoring config |

## CLI (`packages/cli`)
Binary `repometric`, published to npm. Built with Commander.
```
repometric <target> [options]
  <target>              owner/repo, a GitHub URL, or a local path such as .
  --json                print AnalysisReport as JSON
  --min-score <n>       exit 1 if score is below n
  --token <t>            GitHub token (or env GITHUB_TOKEN)
  --open                open the web report in the browser
  --no-color
```
Exit codes: 0 ok, 1 score below `--min-score`, 2 usage error, 3 repo not found or private, 4 rate limited or network failure.

Output (default):
```
owner/repo  68/100  Needs work   (projected 86 after fixes)

Activity         14/20
Maintenance      12/20
Community         6/15
Documentation    16/20
Hygiene           8/15
Dependencies      8/10

Top fixes
  +4.0  Add a LICENSE file                (S)
  +6.0  Add a CI workflow                 (S)
  +3.5  Add tests                         (L)
```
Local path mode builds a `RepoSnapshot` from the filesystem and the `git` binary (`git log` for commits). Signals that need GitHub issue or PR data become `na`. Never uploads anything.
