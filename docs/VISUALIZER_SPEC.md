# Visualizer specification

The visualizers are the flagship feature. Both live in `packages/viz`, draw on Canvas 2D, take data as props, and share one selection store. They never fetch data.

## 1. Shared behavior
- **Selection store** (Zustand): `{ view: 'map' | 'graph', selectedPath, hoveredPath, colorMode, focusDepth, query }`. Selecting a file in one view highlights it in the other and fills the side panel.
- **URL state**: `?view=map&color=language&sel=src/app.ts&depth=2&q=utils`. Reading the URL restores the view; changing state replaces the URL (no history spam).
- **Side panel** for the selected file: path, language, size, last known metrics, "imports" and "imported by" lists (each clickable), and any health signal that mentions the file.
- **Rendering**: Canvas with `devicePixelRatio` scaling, redraw on demand through `requestAnimationFrame` (never a permanent loop when idle). Colors come from CSS variables read once per theme change.
- **Legend** always visible at the bottom of the canvas: what size means, what color means, and the scale.
- **Reduced motion**: `prefers-reduced-motion` disables the draw-in and animated zoom (jump instead).
- **Empty and error states**: say what happened and what to do (for example "No JavaScript, TypeScript or Python files found, so the dependency graph isn't available. The map still works.").

## 2. Repo Map

### Data
`buildHierarchy(files) -> MapNode` (folders sum descendant sizes). Area represents file size in bytes (labelled "size").

### Layout and rendering
- `d3-hierarchy` squarified treemap, `paddingInner 1px`, `paddingTop 16px` for folder header strips, depth-based padding so nesting is readable.
- Folders draw a header strip with the folder name when width is at least 80 px; files draw a label when width is at least 60 px and height at least 16 px. Skip tiles under 1 px.
- Tile corner radius 3 px (`--radius-tile`). Tiles and folder strips get a 1 to 2 px outline in `--ink` (1 px when tiles are small) so they pop against the card, matching the sticker look in `DESIGN_SYSTEM.md`. Hovered tiles lift 1 to 2 px with a hard `--ink` shadow.
- Hit-testing: keep a flat array of rects sorted by depth, test from deepest up; use `d3-quadtree` over tile centers for dense maps.

### Navigation
- Click a folder to zoom into it (re-layout the subtree to fill the canvas, animated 250 ms). Breadcrumb bar above the canvas zooms out. `Esc` goes up one level.
- Wheel or pinch for pixel zoom up to 8x with `d3-zoom`, drag to pan. Double-click resets.
- Hover shows a card: path, language, size, imports in/out, test sibling yes/no.
- Search box: typing filters and flies to the best match; matching tiles get a ring, others dim.
- Minimap in a corner when pixel-zoomed (P1).

### Color modes
| Mode | Pri | Encoding |
|---|---|---|
| Language | P0 | Okabe-Ito categorical palette for the 7 most common languages in the repo, neutral grey for the rest |
| Size | P0 | Sequential scale (YlGnBu, 5 classes) by file size |
| Import fan-in | P0 | Sequential scale by number of files importing it. Requires the graph; disabled with a tooltip until the graph is ready |
| Test sibling | P0 | Files with a matching test file in `--lime`; source files without one get a diagonal hatch pattern (not color alone). Match by name (`a.ts` and `a.test.ts`, `a.py` and `test_a.py`) |
| Churn | P1 | Commits in last 90 days. Computed for the 100 largest source files through batched GraphQL `history(path:)` queries; other files render neutral |
| Top author share | P1 | Same source as churn |

### Hot spots layer (P1)
Toggle that outlines files that are in the top 10% by size and top 10% by fan-in.

## 3. Dependency Graph

### Data
`GraphData` from `core` (see `ARCHITECTURE.md`). Nodes are files; edges are `static` or `dynamic` imports. External packages are hidden by default and can be shown as small square nodes.

### Building the graph (core)
- JS/TS: `es-module-lexer` finds `import`, `export ... from`, `require('x')` and `import('x')` with string literals. Resolve relative specifiers with extensions `.ts .tsx .js .jsx .mjs .cjs` and `/index.*`. Read `tsconfig.json` or `jsconfig.json` `baseUrl` and `paths` for aliases. Bare specifiers that don't resolve to a repo file are externals.
- Python: parse `import a.b` and `from a.b import c`, including relative forms (`from . import x`, `from ..pkg import y`). Resolve against the importing file's directory and against top-level packages found in the repo (directories with `__init__.py` and top-level modules).
- Anything that cannot be resolved increments `unresolvedCount`. Show that count in the insights panel.
- Cycles: Tarjan strongly connected components; report components with more than one node and self-loops as cycles.
- Orphans: `fanIn = 0` and `fanOut = 0`, or `fanIn = 0` for files that are not entry-like (`index`, `main`, `app`, `cli`, `server`), not tests and not config. Label as "possibly unused", never "unused".
- Limits: parse at most 3,000 source files (prefer smaller files first, mark `truncated`), 200 KB per file, concurrency 8. If more than 2,000 nodes would be drawn, collapse to folder level (choose the folder depth that keeps nodes at 800 or fewer) and aggregate edges with weights; set `collapsedToFolders`.
- Run all of this in a Web Worker, posting progress (`{ parsed, total }`) so the UI shows a progress bar.

### Layout and rendering
- `d3-force`: `forceLink` (distance 30), `forceManyBody` (strength about -60, scaled down as node count grows), `forceCollide` (node radius plus 1), weak `forceX/forceY` gravity, and a custom folder-cluster force pulling nodes toward their folder centroid (strength 0.05).
- Stop the simulation when alpha falls below 0.02. Drag a node to pin it; double-click unpins.
- Node radius `clamp(3 * sqrt(fanIn + fanOut + 1), 3, 14)`. Color uses the same color modes as the Map. Edges are 1 px lines at 25% opacity; arrowheads only when a neighborhood is highlighted.
- Folder clusters drawn as soft hulls behind nodes (`d3-polygon` hull with padding), labelled with the folder name.
- Hit-test with `d3-quadtree.find(x, y, radius)`.

### Interactions
- Hover a node: dim everything except its direct neighbors, show the hover card.
- Click: select (shared store). Double-click: focus the neighborhood at `focusDepth` (1 to 3 hops, undirected BFS), with a depth slider and a "show all" button.
- Filters: folder, extension, "hide tests", "show external packages".
- Cycles highlighted in `--coral`.
- Layout modes: force (P0), hierarchical by import depth (P1), radial around the selected node (P2).

### Insights panel
Top 10 by fan-in ("most depended on"), top 10 by fan-out, the list of cycles (click to highlight that cycle), possibly unused files, and the unresolved import count. Every row is clickable and sets the selection.

## 4. Accessibility
- Both canvases are focusable. Map: arrow keys move between sibling tiles, `Enter` zooms into a folder or selects a file, `Esc` goes up. Graph: `Tab` focuses the canvas, `[` and `]` cycle through neighbors of the selected node, `Enter` focuses its neighborhood, `Esc` clears.
- Provide a "View as table" toggle for each view: the Map as a sortable file list (path, size, language), the Graph as a table of nodes with fan-in and fan-out.
- Mirror the current selection in an `aria-live="polite"` status line.
- Never rely on color alone (hatching for "no test", labels on hot spots). Palettes in `DESIGN_SYSTEM.md` are color-blind safe.

## 5. Export
- PNG (P1): `canvas.toBlob`, with the legend drawn onto the image and the repo name and SHA in a footer strip.
- SVG export of the Map (P2). JSON of `GraphData` via the report export.

## 6. Performance targets and tests
- Map: 5,000 tiles at 60 fps while panning. Graph: 2,000 nodes at 60 fps during interaction.
- Unit-test the pure parts: hierarchy building, import resolution (fixtures for aliases, index files, relative parents, Python relative imports), cycle detection, fan counts, collapse logic.
- A Playwright test loads a fixture report and checks that selecting a file in the Map highlights it in the Graph.
