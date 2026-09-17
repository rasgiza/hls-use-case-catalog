# Single-File Technology Radar

Choose technology after defining the experience. "Cutting edge" means using the browser well, not maximizing dependencies.

## Adopt

- Semantic HTML and native form controls
- CSS custom properties, cascade layers, grid, subgrid, container queries, logical properties, `clamp()`, and `color-mix()` with fallbacks
- ES modules only when they remain compatible with the chosen `file://` execution path; otherwise use a deferred classic script
- `HTMLDialogElement` for modal review and confirmation
- Popover API for non-modal transient detail, with a non-popover fallback
- Custom elements when a repeated stateful component benefits from encapsulation
- `Intl` for dates and numbers; `crypto.randomUUID()` only for disposable synthetic UI state
- View Transitions API as progressive enhancement for meaningful state changes

## Trial With Evidence

- Chart.js or Observable Plot for data-heavy analytical views
- Leaflet for a workflow where geography is essential
- Three.js for spatial, device, imaging, or simulation experiences that genuinely need 3D
- Lucide icons from a reviewed, pinned source when inline symbols are insufficient

For trial items, document why native SVG/Canvas is inadequate, pin the version, avoid telemetry, and provide a readable no-network state. A CDN import means the artifact is single-file but not fully offline; say so explicitly.

## Avoid By Default

- React, Vue, Svelte, Tailwind, runtime JSX compilers, and build-only component kits for a one-file mock
- Unpinned CDN URLs, copied minified bundles, icon fonts, remote stock photos, and libraries loaded for one small effect
- Browser storage for sensitive-looking records
- Service workers, authentication simulations that collect credentials, analytics, and live AI/API calls

## Decision Record

For each non-native dependency record: capability needed, options considered, selected version/source, offline behavior, license/provenance, and removal path.