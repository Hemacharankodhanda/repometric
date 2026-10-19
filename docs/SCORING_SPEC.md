# Scoring specification

Scoring is a pure function: `scoreSnapshot(snapshot) -> AnalysisReport`. Same input, same output. Weights and thresholds live in one config file, `packages/core/src/scoring/config.ts`, so they can be tuned without touching logic.

## 1. Model
- Six categories with weights: Activity 20, Maintenance 20, Community 15, Documentation 20, Hygiene 15, Dependencies 10. Total 100.
- Each category has signals. Each signal has `max` points and returns `earned` between 0 and `max`.
- Helper: `clamp01(x) = min(1, max(0, x))`.
- Statuses:
  - `na`: signal does not apply (for example no manifest). Excluded from the category's maximum.
  - `no_data`: it applies but there is nothing to measure (for example no issues exist). Earns 50% of `max` and shows "not enough data" in the evidence.
  - `pass` (earned = max), `partial`, `fail` (earned = 0).

### Normalization
For each category:
```
applicableMax = sum(max of signals where status != 'na')
categoryEarned = applicableMax == 0 ? excluded : weight * (sum(earned) / applicableMax)
```
Final score:
```
score = round(100 * sum(categoryEarned of included categories) / sum(weight of included categories))
```
Grade: 90+ `excellent`, 75-89 `good`, 55-74 `needs-work`, below 55 `at-risk`.

## 2. Signals

### Activity (weight 20)
| ID | Max | Rule |
|---|---|---|
| `activity.commits_90d` | 8 | `8 * clamp01(commitsLast90Days / 30)` |
| `activity.last_commit` | 6 | Days since last commit: <=14 gives 6, <=30 gives 5, <=90 gives 3, <=180 gives 1, else 0 |
| `activity.releases` | 6 | Releases plus tags in last 365 days: 0 gives 0, 1-2 gives 3, 3 or more gives 6 |

### Maintenance (weight 20)
Consider only issues and PRs created in the last 180 days by someone other than the repo owner and not a bot (login ends with `[bot]`).
| ID | Max | Rule |
|---|---|---|
| `maintenance.first_response` | 8 | Median hours to first response by someone other than the author: <=48 gives 8, <=168 gives 6, <=720 gives 3, else 0. No qualifying items: `no_data` |
| `maintenance.stale_issues` | 6 | `ratio = openIssuesNotUpdatedIn90Days / openIssues`. `6 * (1 - clamp01((ratio - 0.10) / 0.50))`. Zero open issues: pass |
| `maintenance.pr_merge_rate` | 6 | Among PRs closed in last 180 days: `6 * clamp01((merged / closed) / 0.70)`. None closed: `no_data` |

### Community and bus factor (weight 15)
| ID | Max | Rule |
|---|---|---|
| `community.bus_factor` | 7 | `share` = top author's share of commits in last 365 days. `7 * clamp01((0.95 - share) / 0.45)`. Evidence mentions "solo project" if only one author |
| `community.contributors` | 4 | Distinct commit authors in last 365 days `n`: `4 * clamp01((n - 1) / 4)` |
| `community.files` | 4 | `CONTRIBUTING*` is 2, `CODE_OF_CONDUCT*` is 1, issue or PR template (`.github/ISSUE_TEMPLATE/**`, `.github/pull_request_template.md`) is 1 |

### Documentation (weight 20)
| ID | Max | Rule |
|---|---|---|
| `docs.readme_exists` | 3 | A README file at the repo root, any extension |
| `docs.readme_sections` | 8 | Title and intro (>= 20 words in the first paragraph): 2. Install or setup (heading matching `/install|setup|getting started|quick ?start/i`, or a code fence with an install command): 2. Usage or examples (heading matching `/usage|example|how to|demo/i` or a second code fence): 2. Visuals (an image or video link, or a homepage URL set): 1. License mention (heading `/license/i` or a license badge): 1. If the README is under 300 characters, cap the total at 2 |
| `docs.metadata` | 3 | Repo description set: 2. At least 3 topics: 1 |
| `docs.folder` | 3 | A `docs/` directory with at least one file, or a homepage URL set: 3, else 0 |
| `docs.comments` | 3 | Comment-line density `d` over the sampled source files (comment lines / non-blank lines): `0.05 <= d <= 0.35` gives 3; `0.02 <= d < 0.05` or `d > 0.35` gives 1.5; else 0. No source files: `na` |

### Engineering hygiene (weight 15)
| ID | Max | Rule |
|---|---|---|
| `hygiene.tests` | 4 | Count test files (paths in `tests/`, `test/`, `__tests__/`, `spec/`, files `*.test.*`, `*.spec.*`, `*_test.py`, `test_*.py`, `*_test.go`): 3 or more gives 4, 1-2 gives 2, 0 gives 0 |
| `hygiene.ci` | 4 | Any of `.github/workflows/*.yml`, `.gitlab-ci.yml`, `.circleci/config.yml`, `azure-pipelines.yml`, `Jenkinsfile` |
| `hygiene.lint_format` | 2 | Any of ESLint, Prettier, Biome, `.editorconfig`, `ruff.toml`, `.flake8`, or `[tool.ruff]` / `[tool.black]` in `pyproject.toml` |
| `hygiene.gitignore` | 1 | `.gitignore` at root |
| `hygiene.license` | 2 | `LICENSE*` or `COPYING*` at root, or `meta.license` set |
| `hygiene.secrets` | 2 | 2 if no committed path matches `.env`, `.env.*` (except `.env.example`, `.env.sample`, `.env.template`), `*.pem`, `id_rsa`, `*.p12`, `*.keystore`, `credentials.json`; else 0. Name-based only; do not claim the repo is secret-free |

### Dependencies (weight 10)
Applies per manifest ecosystem found; no manifest makes every signal `na`.
| ID | Max | Rule |
|---|---|---|
| `deps.lockfile` | 3 | Lockfile present (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `poetry.lock`, `Pipfile.lock`, `uv.lock`), or a `requirements.txt` where at least 80% of lines are pinned with `==` |
| `deps.outdated` | 5 | Over up to 50 direct dependencies (runtime and dev, alphabetical): `behind` = declared major is lower than registry latest major. `ratio = behind / total`. `5 * (1 - clamp01((ratio - 0.10) / 0.50))`. Zero dependencies: `na` |
| `deps.deprecated` | 2 | 0 if any direct dependency is marked deprecated by its registry, else 2 |

## 3. Fix list
For every applicable signal with `earned < max`, create a fix:
```
pointsGain = (max - earned) * (categoryWeight / categoryApplicableMax) * (100 / sumOfIncludedWeights)
effortWeight: S = 1, M = 3, L = 8
priority = pointsGain / effortWeight
```
Sort by `priority` descending, ties by `pointsGain` descending. `projectedScore = min(100, round(score + sum(pointsGain)))`. Round displayed gains to one decimal.

Fix templates (title, effort). `why` is one sentence on the benefit; `how` is one or two concrete steps. Copy rules are in `DESIGN_SYSTEM.md`.
| Signal | Title | Effort |
|---|---|---|
| `activity.commits_90d` | Commit regularly | L |
| `activity.last_commit` | Push a recent update | S |
| `activity.releases` | Publish a release | S |
| `maintenance.first_response` | Reply to issues and PRs within a week | M |
| `maintenance.stale_issues` | Triage stale issues | M |
| `maintenance.pr_merge_rate` | Review and close open pull requests | M |
| `community.bus_factor` | Bring in a second contributor | L |
| `community.contributors` | Invite contributors | L |
| `community.files` | Add CONTRIBUTING and issue templates | S |
| `docs.readme_exists` | Add a README | S |
| `docs.readme_sections` | Complete the missing README sections | M |
| `docs.metadata` | Add a description and topics | S |
| `docs.folder` | Add a docs folder or homepage link | M |
| `docs.comments` | Comment the non-obvious code | M |
| `hygiene.tests` | Add tests | L |
| `hygiene.ci` | Add a CI workflow | S |
| `hygiene.lint_format` | Add a linter or formatter config | S |
| `hygiene.gitignore` | Add a .gitignore | S |
| `hygiene.license` | Add a LICENSE file | S |
| `hygiene.secrets` | Remove committed secrets and rotate them | M |
| `deps.lockfile` | Commit a lockfile | S |
| `deps.outdated` | Update outdated dependencies | M |
| `deps.deprecated` | Replace deprecated packages | M |

## 4. Testing requirements
- One unit test per signal covering each branch and boundary value (for example exactly 14 days, exactly 30 commits).
- Golden snapshot tests of the full `AnalysisReport` for these fixtures in `packages/core/test/fixtures/`: `strong-repo`, `student-repo` (no tests, no CI), `abandoned-repo`, `solo-minimal`, `no-manifest`.
- Property test: score is always an integer from 0 to 100; `projectedScore >= score`; fixes are sorted by priority.
- Fixtures are JSON `RepoSnapshot` files. Tests never touch the network.
