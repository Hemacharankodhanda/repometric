-- Repo Analyzer initial schema
-- Writes happen only through server routes using the service role key (bypasses RLS).
-- Public clients may only read.

create extension if not exists pgcrypto;

create table public.repos (
  id               uuid primary key default gen_random_uuid(),
  owner            text not null,
  name             text not null,
  default_branch   text,
  last_analyzed_at timestamptz,
  created_at       timestamptz not null default now(),
  constraint repos_owner_name_key unique (owner, name),
  constraint repos_owner_lower check (owner = lower(owner)),
  constraint repos_name_lower check (name = lower(name))
);

create table public.analyses (
  id              uuid primary key default gen_random_uuid(),
  repo_id         uuid not null references public.repos(id) on delete cascade,
  commit_sha      text not null,
  score           smallint not null check (score between 0 and 100),
  grade           text not null check (grade in ('excellent','good','needs-work','at-risk')),
  category_scores jsonb not null,
  fixes           jsonb not null,
  projected_score smallint not null check (projected_score between 0 and 100),
  core_version    text not null,
  created_at      timestamptz not null default now(),
  constraint analyses_repo_sha_key unique (repo_id, commit_sha)
);
create index analyses_repo_created_idx on public.analyses (repo_id, created_at desc);

create table public.graphs (
  analysis_id uuid primary key references public.analyses(id) on delete cascade,
  nodes       jsonb not null,
  edges       jsonb not null,
  stats       jsonb not null,
  truncated   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.badge_hits (
  repo_id uuid not null references public.repos(id) on delete cascade,
  day     date not null,
  count   integer not null default 0,
  primary key (repo_id, day)
);

create table public.rate_state (
  key        text primary key,          -- e.g. 'analyze:1.2.3.4'
  tokens     integer not null,
  updated_at timestamptz not null default now()
);

-- Atomic badge counter (called from the badge route on edge cache misses)
create or replace function public.increment_badge_hit(p_repo_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.badge_hits (repo_id, day, count)
  values (p_repo_id, current_date, 1)
  on conflict (repo_id, day) do update set count = public.badge_hits.count + 1;
$$;
revoke all on function public.increment_badge_hit(uuid) from public, anon, authenticated;

-- Row level security: public read of analysis data, no public writes.
alter table public.repos       enable row level security;
alter table public.analyses    enable row level security;
alter table public.graphs      enable row level security;
alter table public.badge_hits  enable row level security;
alter table public.rate_state  enable row level security;

create policy "public read repos"    on public.repos    for select using (true);
create policy "public read analyses" on public.analyses for select using (true);
create policy "public read graphs"   on public.graphs   for select using (true);
-- badge_hits and rate_state: no policies, so only the service role can touch them.
