# Setup

Everything here is free. Do the accounts once, then follow `ROADMAP.md`.

## 1. Accounts
- GitHub (repo, Actions, token)
- Vercel (Hobby plan)
- Supabase (free project)
- npm (for publishing the CLI later)

## 2. GitHub token (server-side)
1. GitHub, Settings, Developer settings, Fine-grained tokens, Generate new token.
2. Resource owner: your account. Repository access: **Public repositories (read-only)**.
3. No extra permissions are needed. Copy the token into `GITHUB_TOKEN`.
This raises the limit from 60 to 5,000 requests per hour.

## 3. Supabase
1. Create a project and note the project URL, the anon key and the service role key.
2. Open the SQL editor and run `supabase/migrations/0001_init.sql` (or use the Supabase CLI: `supabase db push`).
3. The service role key is server-only. Never put it in a `NEXT_PUBLIC_*` variable.
4. Free projects pause after a week of inactivity. The daily keep-alive cron (task T4.4) prevents that.

## 4. Environment variables
Copy `.env.example` to `apps/web/.env.local` and fill it in.

| Variable | Where used | Secret |
|---|---|---|
| `GITHUB_TOKEN` | Server: GitHub API calls | Yes |
| `SUPABASE_URL` | Server | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Yes** |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (read-only access) | No |
| `NEXT_PUBLIC_SITE_URL` | Links, Open Graph tags, badges | No |
| `CRON_SECRET` | Authorizes `/api/cron/keepalive` | Yes |

## 4b. Running locally
```
pnpm install
pnpm dev
```
Open http://localhost:3000.

## 5. Deploy (Vercel)
1. Import the GitHub repo into Vercel. Root directory: `apps/web`. Framework: Next.js.
2. Add all variables from section 4 in Project Settings, Environment Variables.
3. Add `vercel.json` with the daily cron:
```json
{ "crons": [{ "path": "/api/cron/keepalive", "schedule": "0 6 * * *" }] }
```
4. Vercel Hobby is for non-commercial use. This is a portfolio project, which fits. Do not add paid features.

## 6. Publishing the CLI (later, task T4.2)
`npm login`, then publish from `packages/cli` with `pnpm publish --access public`. Check that the package name is free on npm early (`npm view <name>`).

## 7. Free-tier limits to remember
- GitHub API: 5,000 requests per hour with a token. Cache aggressively.
- Supabase free: small database and pause after inactivity. Store only derived data.
- Vercel Hobby: function duration and bandwidth caps. Serve badges and graphs with long cache headers.
Check the current limits on each provider's pricing page before launch, since they change.
