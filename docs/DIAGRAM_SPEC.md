# Diagram specification

## 1. Types (`packages/core/src/diagram/types.ts`)
```ts
export interface DiagramComponent {
  id: string;
  label: string;
  path: string;
  fileCount: number;
  layer: LayerId;
}

export type LayerId = 'client' | 'server' | 'core' | 'data' | 'shared' | 'other';

export interface DiagramExternal {
  id: string;
  label: string;
  kind: 'database' | 'service' | 'library';
  importedBy: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  weight: number;
  cyclic: boolean;
}

export interface DiagramSpec {
  components: DiagramComponent[];
  externals: DiagramExternal[];
  edges: DiagramEdge[];
  externalEdges: { from: string; to: string; weight: number }[];
  notes: string[];
}
```

## 2. `buildDiagramSpec(files: FileNode[], graph: GraphData | null): DiagramSpec`
Pure, deterministic, no I/O:
a. **Components, first match wins**:
   - Workspace packages: directories under `apps/`, `packages/`, `services/`, `libs/` that contain a `package.json` (or `pyproject.toml` / `setup.py`) in the file list.
   - Else, if `src/` exists: each direct child folder of `src/`.
   - Else: each top-level folder, excluding `docs`, `test`, `tests`, `__tests__`, `.github`, `.vscode`, `assets`, `public`, `static`, `scripts`, `config`, `node_modules`, `dist`, `build`, `vendor`. Root-level source files form one "root" component.
   Assign every source file to the component with the longest matching path prefix. Ignore tests, config files and non-source files for `fileCount`.
   Cap at 25 components: merge the smallest (under 2% of source files) into one "other" component.
b. **Layers by folder-name heuristics** (case-insensitive, match any path segment of the component):
   - `client`: `components`, `ui`, `pages`, `app`, `views`, `screens`, `client`, `frontend`, `hooks`, `styles`
   - `server`: `api`, `routes`, `controllers`, `server`, `backend`, `handlers`, `middleware`, `functions`
   - `core`: `lib`, `core`, `services`, `domain`, `engine`
   - `data`: `db`, `database`, `models`, `schema`, `migrations`, `prisma`, `repositories`, `store`
   - `shared`: `utils`, `helpers`, `shared`, `common`, `types`
   - anything else: `other`
c. **Edges**: if graph is present, aggregate file-level `GraphEdge` into component-to-component edges with weights (count of file imports), ignoring self edges. Drop edges whose weight is below `max(1, ceil(0.02 * maxWeight))`. Find cycles between components with Tarjan SCC and mark edges inside a cycle as `cyclic = true`. For non-cyclic edges, remove `A->C` when `A->B->C` exists and `weight(A->C)` is under 25% of the maximum weight (transitive reduction).
d. **Externals**: take `graph.externals` (make sure buildGraph always populates it), keep the top 8 by `importedBy`, and label them using a lookup table at `packages/core/src/diagram/externals.ts` mapping package names to `{ label, kind }`. Include at least 40 well-known entries, for example `next`, `react`, `express`, `fastify`, `@supabase/supabase-js` (database), `prisma`, `mongoose`, `pg`, `redis`, `firebase`, `stripe`, `openai`, `axios`, `tailwindcss`, `django`, `flask`, `fastapi`, `sqlalchemy`, `requests`, `numpy`, `pandas`. Unknown packages keep their name with kind `'library'`. Build `externalEdges` from components to externals.
e. If graph is null (unsupported language or not built yet), return components only and add a note: "No dependency data for this repository, so connections are not shown."
f. Hard cap total drawn nodes at 40 (components + externals); trim externals first, then merge more components into "other". Record what you trimmed in notes.

## 3. `compileMermaid(spec, ctx: { owner: string; repo: string; sha: string }, theme?: ThemeColors): { mermaid: string; nodeMap: Record<string, { kind: 'component' | 'external'; path?: string; url?: string }> }`
Pure:
- Output `"flowchart TD"`. One subgraph per non-empty layer (Client, Server, Core, Data, Shared, Other), in that order. Externals sit in a subgraph named "External".
- Node ids are generated (`"c0"`, `"c1"`, `"e0"`), never derived from repo strings. Labels are double-quoted with a strict escape function (strip or replace quotes, brackets, angle brackets, backticks, pipes, backslashes; collapse whitespace; truncate to 40 characters). Label format for components: `"name (N files)"`.
- Edges: `"-->"` with the weight as the label only when `weight >= 5`. Cyclic edges get a distinct style via `linkStyle`. Use `classDef`/`class` lines for layer styling, using hex values passed in from a `ThemeColors` argument (read from the CSS tokens at runtime; do not hard-code hex in core).
- Do NOT use Mermaid's click directive. `nodeMap` holds each node's repo path and a GitHub URL: `https://github.com/{owner}/{repo}/tree/{sha}/{encodeURI(path)}`.
- Output must be byte-for-byte deterministic for the same input.

## 4. Diagram tab UI (`packages/viz/src/ArchitectureDiagram.tsx`, lazy loaded; wire into the report page as a fourth tab "Diagram")
- Compute spec in the browser with `buildDiagramSpec` from `files` + `graph` (`useMemo`; no new network calls and no new database columns). Show the existing loading and error patterns. Show `spec.notes` under the canvas as a plain sentence.
- Render with `mermaid` (dynamic import), initialize with `securityLevel 'strict'`, `startOnLoad false`, `theme 'base'`, `themeVariables` built from the CSS tokens, `maxTextSize` raised explicitly. Re-render when the theme changes. Sanitize the SVG with `DOMPurify` before inserting.
- Interactivity without Mermaid click directives: after render, find node elements, map them back to `nodeMap` ids, add pointer and keyboard handlers. Clicking a component sets `selectedPath` in the shared selection store (so the Map and Graph highlight that folder) and shows a side panel with the component name, file count, layer, its incoming and outgoing connections (clickable) and an "Open on GitHub" link. Hover highlights a node and its direct connections and dims the rest.
- Pan and zoom with `d3-zoom` (wheel, pinch, drag), a "Reset view" button, fit-to-screen on load.
- Toolbar: Copy Mermaid code, Download SVG, Download PNG (draw the SVG to a canvas at 2x, include a footer strip with repo name and short SHA), Copy as README snippet (a markdown ```mermaid fenced block), a toggle "Show file counts on edges".
- Accessibility: provide a "View as list" toggle that shows components, layers and connections as a keyboard-navigable list or table; arrow keys move between components in that view; `aria-live` status line announces the selection; respect `prefers-reduced-motion`; text contrast per the `*-text` tokens.
- Look: follow the "field survey" design direction. Layer groups use `--fog` fills with `--ink` strokes, external nodes use a `--teal` outline, cyclic edges use `--danger`, labels use the body font. No default Mermaid colors.

## 5. Out of scope in this task
Any LLM or network AI call, private repos, function-level diagrams.
