# Design system: "field survey"

The product shows the shape of a codebase, so the interface borrows from chart-making: paper-like surfaces, ink lines, contour hues and a legend on every visual. The map is the one memorable element. Everything around it stays quiet.

Avoid these defaults: near-black background with one neon accent, monospace on every label, a grid of identical rounded cards with the same soft shadow, all-caps eyebrow labels, gradient washes, numbered markers on content that is not a sequence.

## 1. Tokens
Defined in `apps/web/src/styles/tokens.css` and mapped into Tailwind. Components use tokens only.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#E9EEF0` | `#0F1A26` | Page background |
| `--surface` | `#F5F8F9` | `#16263A` | Panels, popovers |
| `--fog` | `#C9D3D8` | `#223244` | Muted fills, dividers |
| `--ink` | `#14213D` | `#E6EDF0` | Text and lines |
| `--ink-muted` | `#4A5872` | `#9FB0BF` | Secondary text |
| `--teal` | `#2A7F87` | `#4FB3BC` | Primary accent for graphics |
| `--teal-text` | `#1F6068` | `#7FD0D7` | Accent as text or link (meets 4.5:1) |
| `--danger` | `#D6352F` | `#FF6B5E` | Hot spots, cycles, "at risk" |
| `--danger-text` | `#B02620` | `#FF8F85` | Danger as text |
| `--moss` | `#5E8C4A` | `#8DBB78` | Healthy, "good" |
| `--moss-text` | `#3F6B2E` | `#A8D192` | Healthy as text |
| `--focus` | `#2A7F87` | `#4FB3BC` | 2 px focus ring, 2 px offset |

Grade colors: Excellent `--moss`, Good `--teal`, Needs work `--ink-muted` on `--fog`, At risk `--danger`. Show the grade as a word as well as a color.

Data palettes (identical in light and dark unless noted):
- Language categories, Okabe-Ito: `#E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7`, other languages `#999999`.
- Sequential (size, fan-in), YlGnBu 5 classes: `#FFFFCC #A1DAB4 #41B6C4 #2C7FB8 #253494`.

## 2. Type
- Headings and the score numeral: **Bricolage Grotesque** (variable, via `next/font/google`).
- Body and UI: **Instrument Sans**.
- Code, file paths and SHAs only: **JetBrains Mono**. Not for decorative labels.
- Scale (ratio 1.25, rem): 0.8, 1, 1.25, 1.563, 1.953, 2.441, 3.815 (score numeral).
- Line height 1.5 for body, 1.2 for headings. Max line length 70 characters for prose.
- Sentence case everywhere. No all-caps labels.

## 3. Space, shape, elevation
- 4 px spacing unit (Tailwind default scale).
- Radii by role, not one value everywhere: data tiles 2 px, controls 6 px, panels 12 px.
- No decorative shadows. Popovers and menus get one subtle shadow; everything else uses 1 px lines (`ink` at 15% opacity).

## 4. Layout
```
+--------------------------------------------------+
| repometric        [ github.com/owner/repo  ]  |
+------------+-------------------------------------+
|  68        |  Map | Graph | Report               |
|  Needs     |  +-------------------------------+  |
|  work      |  |  [ zoomable treemap /         |  |
|            |  |    dependency graph ]         |  |
|  Fixes     |  |                               |  |
|  1 License |  +-------------------------------+  |
|  2 CI      |  legend: size = lines, color = ...  |
+------------+-------------------------------------+
```
- Left aligned. The score panel is a narrow rail (about 280 px) with the score numeral, grade word, projected score and the top fixes. On mobile the rail collapses above the canvas.
- Landing page (`/`): the URL input with a live, already-drawn example map beneath it. No marketing hero, no feature-card grid.
- Report tab: category scores as a ranked legend (name, a thin bar, earned/max, expandable evidence), not a row of identical cards.

## 5. Components
Build on shadcn/ui primitives, restyled with tokens: Button, Input, Tabs, Tooltip, Popover, Dialog, Toast, Switch, Slider, Select.

Custom components:
- `RepoInput`: one field, a clear submit action ("Analyze repository"), inline validation.
- `ScoreSummary`: numeral, grade word, projected score line ("86 after the fixes below").
- `FixItem`: title, points gain (for example "+4.0"), effort (S, M or L with its meaning in a tooltip), expandable why and how.
- `CategoryRow`: name, bar, earned/max, expandable signal list with evidence.
- `Legend`: describes size and color encoding; always sits at the bottom of a visualizer.
- `HoverCard` and `SidePanel` for file details.
- `EmptyState` and `ErrorState`: one sentence for what happened, one for what to do.

## 6. Motion
- One orchestrated moment: when a map first loads, tiles draw in once over about 600 ms, staggered by depth.
- Motion that answers an action is fine: zooming into a folder (250 ms), expanding evidence, selecting a node.
- No scroll-triggered fade-ins, no hover animation on every card. Honor `prefers-reduced-motion`.

## 7. Copy
- Say what something is or does, in plain words. Use the user's vocabulary: "health score", "fix", "imports", not internal terms.
- Buttons name the exact action: "Analyze repository", "Copy badge", "Download JSON". The success message reuses the same verb: "Badge copied".
- Errors say what went wrong and how to fix it, without apologizing: "GitHub's rate limit is used up. Try again in 12 minutes, or add a GitHub token in the CLI."
- Examples of good fix copy: title "Add a LICENSE file", why "Without a license, nobody can legally reuse your code.", how "Create a `LICENSE` file at the repo root. GitHub offers templates under Add file, then Create new file."

## 8. Accessibility floor
- Text contrast at least 4.5:1 (use the `*-text` tokens for colored text); graphics at least 3:1.
- Visible keyboard focus on everything interactive; no focus traps.
- Every visualizer has a table alternative and keyboard navigation (see `VISUALIZER_SPEC.md`).
- Never rely on color alone. Use words, hatching or icons alongside it.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`; provide a manual theme toggle.
- Touch targets at least 44 px on mobile.
