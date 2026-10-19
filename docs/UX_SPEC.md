# UX spec: landing page and web app

Goal: a first-time visitor understands what RepoMetric does within 5 seconds and can try it within 10, with no sign-up. Look and feel follow `DESIGN_SYSTEM.md`. All sample data is labelled "sample" until real analyses exist. Never invent stats or testimonials.

## 1. Landing page (`/`)

Sections in this order. Copy below is the starting text; keep it short and plain.

### 1.1 Nav (sticky)
Wordmark `repometric` with a small Tilly icon on the left. Links: How it works, What you get, FAQ, and a GitHub link. A primary button "Analyze a repo" scrolls to the input. On mobile collapse the links into a menu.

### 1.2 Hero
- Headline: **Is your repo any good? Find out in 10 seconds.** (lime marker behind "10 seconds")
- Subline: "Paste a GitHub link. Get a health score, a to-do list that fixes it, and an interactive map of your code. Free, no sign-up."
- Big `RepoInput` (placeholder `github.com/owner/repo`, button "Analyze repo"). Beneath it: "Try one:" chips for four well-known public repos that open their reports directly (sample until real).
- Beside or below: a **live interactive preview** built from mock data: a score sticker (68, "Needs work") with Tilly, and a small treemap whose tiles pop in and lift on hover. Caption: "Sample output. Hover the tiles."
- Trust line: "Read-only. We never run your code or store it."

### 1.3 How it works
Three numbered steps (numbers are justified: it is a sequence), each with a small illustration and one sentence:
1. **Paste a link.** Any public GitHub repo.
2. **We read the public data.** Commits, issues, files and imports. Nothing is cloned or run.
3. **Get your report.** A score, a fix list, and maps of your code.
Add: "Takes about 10 seconds."

### 1.4 What you get
Alternating blocks (image side flips), each with a small **interactive** demo from mock data and a "why it matters" line:
- **A score with receipts.** "Six areas, 23 checks, every point explained. No mystery number."
- **A to-do list, sorted by payoff.** "Add a license: +4 points, about 2 minutes. Fixes are ranked by points gained per effort."
- **See the whole repo at a glance.** "Every file is a tile. Bigger tile, bigger file. Click a folder to zoom in."
- **Who depends on whom.** "Spot the file everything relies on, and the circular imports that cause headaches."
- **The architecture, drawn for you.** "Components, layers and the services they use, as a diagram you can paste into your README."
- **Show it off (small block).** A live badge preview plus the snippet, and `npx repometric owner/repo` for the terminal.

### 1.5 Who it's for
A bento layout with tiles of different sizes (not identical cards):
- Students: "Polish your portfolio repos before placements."
- Open-source newcomers: "Understand a new codebase in minutes."
- Recruiters: "Judge a repo in 30 seconds."
- Maintainers: "Fail CI when health drops, with `--min-score`."

### 1.6 What we check
Six chips with simple icons and one line each: Activity, Maintenance, Community, Docs, Hygiene, Dependencies. A "See every check" link goes to `/methodology`.

### 1.7 Try a real repo (gallery)
Six pre-analyzed well-known repos as sticker cards with their score and grade; each opens its report. Before real data exists, show mock cards labelled "sample".

### 1.8 Privacy and trust
Four short statements with icons: Read-only. Public repos only. We never run your code. We store scores and import links, never your source.

### 1.9 FAQ (accordion, keyboard accessible)
- Is it free? Yes, and there is no sign-up.
- Does it work on private repos? Not yet. Public repos only.
- How is the score calculated? Six weighted areas, every point explained on the methodology page.
- Which languages are supported? The score and map work for any language. The dependency graph and diagram support JavaScript, TypeScript and Python for now.
- Does it run my code? Never. It only reads public data.
- How do I add the badge? Copy the snippet from your report page into your README.

### 1.10 Final call to action
Large input again with "Ready? Paste a repo link." and a waving Tilly.

### 1.11 Footer
Wordmark, links (Methodology, GitHub, npm), and a "Built by" line from site config constants (`AUTHOR_NAME`, `AUTHOR_URL`).

### 1.12 Page metadata
Title "RepoMetric: health score and map for any GitHub repo", a clear description, Open Graph image, canonical URL.

## 2. Web app flows

### 2.1 Start
Same `RepoInput` everywhere. Invalid input shows an inline, friendly message ("That doesn't look like a GitHub repo. Try owner/repo or paste the URL."). Submit navigates to `/r/[owner]/[repo]`.

### 2.2 Analysis screen
- Tilly in `scanning` mood. A `Stepper` of real stages with friendly labels: Finding the repo, Reading commits and issues, Checking docs, tests and CI, Counting dependencies, Drawing the map, Mapping imports (with "12 of 340 files" progress).
- A cached result skips straight to the report with a brief "Found a fresh report" toast.
- Rotating tips below the stepper, all true and generic ("A good README has install steps, usage and a screenshot.").
- Failures stop the stepper and show an `ErrorState` (see 2.6).

### 2.3 Report page
- **Header strip:** `owner/repo` in mono with a link to GitHub, short SHA, "Re-analyze" button, and a Share menu: Copy link, Copy badge, Download score card, Export JSON, Export Markdown.
- **Summary card:** the score numeral counting up, grade sticker, Tilly in the matching mood, a one-sentence verdict generated from rules (for example "Solid project. Adding CI and tests would take you to 86."), and a projected-score bar.
- **Tabs with icons:** Overview, Fixes, Map, Graph, Diagram. Default is Overview; the tab is stored in the URL.
- **Overview:** six `CategoryRow`s, each with a "What's this?" popover in plain language; the top 3 fixes; and an Insights strip of `InsightCard`s of varied size from graph stats (most depended-on file, number of circular dependencies, biggest folder, files with no tests). Hide cards the data doesn't support.
- **Fixes:** ranked `FixCard`s. Effort chips read "about 10 min", "about 2 hours" or "a project", with S/M/L in a tooltip. A "Mark done" checkbox updates the projected score locally (browser storage only). P1: "Copy template" for LICENSE, `.gitignore` and a CI workflow.
- **Map, Graph, Diagram:** each canvas fills a card. A collapsible "How to read this" strip explains size, color and gestures in one or two lines. The toolbar uses chunky toggle buttons. Tilly may give one dismissable tip per tab ("Click a folder to zoom in.").

### 2.4 First-run tour
Three coach marks, shown once (remembered in browser storage): the score, the fix list, the map. Skippable, keyboard accessible, focus managed.

### 2.5 Share card
`/r/[owner]/[repo]/opengraph-image` generated with Next.js `ImageResponse` at 1200x630: repo name, large score sticker, grade word, a mini treemap drawn from top-level folders as plain rectangles, and the wordmark. The same image is downloadable from the Share menu. This is what makes links look good on LinkedIn, X and chat apps.

### 2.6 Empty and error states
Each has a Tilly mood, one sentence for what happened, one for what to do, and a button:
- Not found (`lost`): "Couldn't find that repo. Check the spelling, and make sure it's public." Button: "Try another repo".
- Private (`neutral`): "That repo looks private. RepoMetric reads public repos only."
- Rate limited (`worried`): explain the wait time and offer the optional "Add your GitHub token" path.
- Too large for the graph (`neutral`): "This repo is too big for the dependency graph, but the score and map still work."
- Unsupported language for the graph: same shape, naming the supported languages.

### 2.7 Celebrations
Confetti and the `celebrating` Tilly once on first view of a score of 90 or higher. Never on re-visits. No celebration under reduced motion.

### 2.8 Responsive behavior
- Mobile is single column. Tabs become a horizontally scrollable bar. Canvases offer a "Full screen" button and support touch (drag, pinch).
- The summary card stacks Tilly under the score.
- The landing preview turns into a static image if viewport width is under 380 px.

## 3. Quality bar (acceptance checklist)
- **5-second test:** a stranger can say what the product does from the hero alone.
- **One dominant action** per screen (the input on the landing page).
- Every metric has a plain-language explanation within one click.
- No horizontal scroll at 375 px. Lighthouse accessibility 95 or higher; performance 90 or higher on the landing page (lazy-load visualizers, `next/font`, optimized images).
- Everything works by keyboard; focus is always visible; reduced motion is respected.
- Dark and light themes both look intentional.
- No placeholder lorem ipsum, no fake numbers, every sample labelled.
