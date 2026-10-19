# Design system: "playful field guide"

RepoMetric should feel like a friendly explorer's field guide: bright, tactile, a little cheeky, and instantly clear. **Clean** means generous space and one idea per screen. **Fun** comes from saturated color, chunky sticker-like shapes, a mascot with moods, and motion that responds to what you do.

This replaces the earlier muted "field survey" direction, which came out too quiet.

## 1. Principles
1. **Clear first, fun second.** Every screen answers "what is this and what do I do next" within 5 seconds.
2. **Stickers on paper.** Flat color fills, 2 px ink outlines, hard offset shadows. No gradients, no glassmorphism, no soft blurry shadows.
3. **The map is the star.** Its tiles are colorful and tactile; the rest of the UI frames it.
4. **Fun is functional.** The mascot shows state (scanning, happy, worried). Motion confirms actions. Nothing moves just to move.
5. **Friendly voice, never snarky about the user's code.**

### Avoid
Gradient washes, glassmorphism, purple-to-pink hero backgrounds, grids of identical cards with soft shadows, stock illustrations, emoji used as icons, all-caps eyebrow labels, walls of text, hover animations on everything.

## 2. Tokens
Defined in `apps/web/src/styles/tokens.css` and mapped into Tailwind. Components use tokens only.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#FFFBF0` | `#14142B` | Page background |
| `--paper-2` | `#F4EFE2` | `#1B1B38` | Alternate sections (with dot grid) |
| `--card` | `#FFFFFF` | `#1F1F3D` | Cards, panels, canvases |
| `--ink` | `#1B1B3A` | `#F5F3FF` | Text, borders, shadows |
| `--ink-muted` | `#5A5A7A` | `#B4B4D6` | Secondary text |
| `--primary` | `#5B5BFF` | `#7C7CFF` | Primary buttons and fills (white text on light mode, ink text on dark) |
| `--primary-text` | `#3A3AD6` | `#A9A9FF` | Links and accent text |
| `--lime` | `#C6F432` | `#C6F432` | Highlights, success, "Excellent" |
| `--sun` | `#FFD23F` | `#FFD23F` | Warnings, "Needs work", stickers |
| `--coral` | `#FF6B57` | `#FF7F6E` | Danger fills, "At risk" |
| `--coral-text` | `#C2362A` | `#FF9C8F` | Danger as text |
| `--sky` | `#7FD6FF` | `#7FD6FF` | Info fills, "Good" |

Fills (`--lime`, `--sun`, `--coral`, `--sky`) always carry `--ink`-colored text in light mode. Never put colored text on `--paper` unless it is a `*-text` token. Grades are always shown as a word as well as a color.

Data palettes stay color-blind safe: Okabe-Ito for languages (`#E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7`, other `#999999`) and YlGnBu for size and fan-in. Every tile and node gets an ink outline so they pop against the card.

## 3. Type
- **Display:** Bricolage Grotesque, weight 800, tight tracking, large (`clamp(2.5rem, 6vw, 4.5rem)` for the hero). Use it for headlines, the score numeral and section titles.
- **Body and UI:** Instrument Sans, 16-18 px, line height 1.55.
- **Code, paths, SHAs:** JetBrains Mono.
- Sentence case. Max line length about 65 characters for prose. Highlight one key phrase per headline with a lime marker swipe (an SVG underlay), not bold color changes.

## 4. Shape and elevation
- Borders: `2px solid var(--ink)` on cards, buttons, inputs, chips and canvases.
- Radii: cards 16 px, controls 10 px, pills 999 px, map tiles 3 px.
- Shadows are hard and offset: cards `4px 4px 0 var(--ink)`, small elements `2px 2px 0`.
- Buttons are chunky: on hover they lift (`translate(-1px,-1px)`, shadow grows to 6 px); on press they sink (`translate(2px,2px)`, shadow 0). Transition 120 ms.
- Section rhythm: alternate `--paper` and `--paper-2` backgrounds. `--paper-2` carries a subtle dot grid (survey-paper feel): `radial-gradient(var(--ink) 1px, transparent 1px)` at 24 px spacing and 8% opacity, as the one allowed use of a gradient function.
- Layout is asymmetric where it helps: vary block sizes in bento layouts, offset illustrations, let sticker badges overlap card corners. Keep generous whitespace.

## 5. The mascot: Tilly
Tilly is a squarish creature (a treemap tile come to life) with two round eyes, a tiny surveyor's cap and a compass on the cap. Build it as an inline SVG React component `Tilly` with props `mood` and `size`.

| Mood | When | Look |
|---|---|---|
| `idle` | Landing, default | Blinks every ~4 s |
| `scanning` | Analysis in progress | Magnifying glass, eyes sweep left-right |
| `happy` | Score 75-89 | Smile, small bounce on reveal |
| `celebrating` | Score 90+ | Arms up, confetti burst once |
| `neutral` | Score 55-74 | Flat mouth, thinking pose |
| `worried` | Score under 55, errors | Raised brows, sweat drop (kind, not mocking) |
| `lost` | Repo not found | Holding a map upside down |

Use flat fills from the palette with ink outlines. Keep it simple (rects, circles, paths). Tilly appears in the hero, the analysis screen, the score summary, empty and error states, and as a corner tip-giver. Don't overuse it: at most one Tilly per screen.

## 6. Components
Build on shadcn/ui primitives restyled with the tokens, plus:
- `StickerBadge`: rotated 2-4 degrees, ink outline, color fill, used for grades, "free", "new", points chips.
- `ChunkyButton`: primary (`--primary` fill), secondary (`--card` fill), ghost. 44 px minimum height.
- `RepoInput`: large field with the button attached, helper text under it, example chips.
- `ScoreSummary`: huge score numeral in display type counting up over 900 ms, grade sticker, Tilly, one-sentence verdict, projected score bar.
- `CategoryRow`: icon, name, thick bar with ink outline, earned/max, "What's this?" popover.
- `FixCard`: title, points chip (`+4`), effort chip, expandable why/how, local "Mark done" checkbox.
- `InsightCard`: one big number or file name with a caption (for example "Most depended-on file").
- `Legend` and `ReadingGuide`: a collapsible "How to read this" strip on every visualizer.
- `Stepper`: for the analysis progress screen.
- `EmptyState` and `ErrorState`: Tilly mood, one sentence for what happened, one for what to do, and a button.
- `Toast`: sticker style, short, reuses the action verb ("Badge copied").

## 7. Motion
- Use the `motion` library (the framer-motion successor, free) with short springs.
- One signature moment per screen: landing hero tiles pop in staggered; score numeral counts up; map tiles draw in over about 600 ms.
- Responsive motion: button lift/press, tile hover lift (1-2 px with shadow), tab indicator slide, accordion expand.
- Confetti (`canvas-confetti`) once when a first-view score is 90 or higher.
- Everything honors `prefers-reduced-motion` (jump to final state, no confetti, no blinking).

## 8. Voice and microcopy
- Friendly, plain, a little playful. Short sentences. Never mock the user's code.
- Buttons name the exact action: "Analyze repo", "Copy badge", "Download score card". Success toasts reuse the verb: "Badge copied".
- Loading lines may joke lightly: "Counting your commits...", "Looking for tests (no judgment)...", "Drawing the map...".
- Errors say what happened and what to do, without apologizing: "Couldn't find that repo. Check the spelling, and make sure it's public."
- Never invent statistics or testimonials. Sample data is always labelled "sample".

## 9. Accessibility floor
- Text contrast at least 4.5:1: ink on paper and on fills passes; white on `--primary` (light) is about 4.8:1; use `*-text` tokens for colored text on paper.
- Focus ring: `3px solid var(--primary)` with 2 px offset (visible against ink borders in both themes).
- Never rely on color alone: grades have words, "no test" tiles use a hatch pattern, statuses have icons.
- Touch targets at least 44 px. Full keyboard operation. Visualizers keep their table views and keyboard navigation (`VISUALIZER_SPEC.md` section 4).
- Rotated stickers must not rotate text over 4 degrees and must stay readable.
- Light, dark and system themes, with a visible toggle.
