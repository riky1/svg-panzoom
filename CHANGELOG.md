# Changelog

All notable changes to **svg-panzoom** will be documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/) and versioning follows [Semantic Versioning](https://semver.org/).

## [0.3.0] - 2026-05-15

### Fixed

- **`src/index.js`**: `api.zoomIn()`, `api.zoomOut()` and `api.zoomTo()` were using `origin || null` as default, leaving origin as `null` when called without arguments (e.g. button clicks). The engine, receiving `null`, applied zoom without adjusting the pan position, making the upper-left corner of the content the de facto center of zoom.
  - Added `getViewportCenter()` helper that calculates the container center in SVG user units, reusing the same CTM-based conversion already used by `getOriginFromEvent`.
  - `api.zoomIn(origin)`, `api.zoomOut(origin)`, `api.zoomTo(scale, origin)` now default to `getViewportCenter()` when `origin` is not provided (using the `??` operator).
  - Behavior for wheel zoom and programmatic zoom with explicit origin is unchanged.

### Added

- Usage examples for Vue and React.

### Changed

- `package.json`: bumped `version` → `0.3.0`.

---

## [0.2.0] - 2026-05-15

### Fixed

- **`examples/basic/main.js`**: removed hardcoded values `minZoom: 0.4` and `zoomStep: 1.2` that were explicitly passed to `createSvgPanZoom()`, silently overriding the `DEFAULT_OPTIONS` defined in `src/core/state.js`. The priority `explicit option > DEFAULT_OPTIONS` made any modification to the library's default values ineffective during local development. The example now inherits `minZoom` and `zoomStep` directly from the defaults (`minZoom: 0.0001`, `zoomStep: 1.25`).

### Changed

- `package.json`: bumped `version` → `0.2.0`.

### Notes

- Option priority follows the rule: **explicitly passed option > `DEFAULT_OPTIONS` in `state.js`**. Not passing an option is equivalent to using the default; passing it explicitly always overrides it, regardless of the value in the defaults.

---

## [0.1.0] - 2026-05-15

### Added

- Initial setup as a **framework-agnostic** library (ES modules) with **Vite library mode** build:
  - ESM bundle (`dist/svg-panzoom.js`)
  - CJS bundle (`dist/svg-panzoom.cjs`)
  - CSS export (`./style.css`).
- Public factory `createSvgPanZoom(options)` with instance and API:
  - `zoomIn()`, `zoomOut()`, `zoomTo(scale, origin?)`
  - `panBy(dx, dy)`, `panTo(x, y)`
  - `reset()`, `fit()`, `center()`
  - `getState()`, `getOptions()`
  - `on(event, callback)`, `off(event, callback)`
  - `destroy()`.
- Core separated from DOM manipulation:
  - `src/core/*` handles state, bounds, events, engine and gesture logic (wheel/pointer).
  - `src/dom/*` handles mount, renderer and observer (measurements and viewport target).
- MVP support:
  - Pan with drag via **Pointer Events**
  - Zoom via **wheel** with minimal normalization (deltaMode)
  - Min/max zoom (`minZoom`, `maxZoom`)
  - Basic bounds with padding (`bounds.enabled`, `bounds.padding`)
  - Custom events (`change`, `zoom`, `dragstart`, `drag`, `dragend`, `reset`, `fit`, `center`, `measure`, `wheel`).
- Initial SCSS with BEM convention prefix `spz`:
  - Base classes: `.spz`, `.spz__canvas`, `.spz__svg`, `.spz__viewport`, `.spz__controls`, `.spz__button`.
- Example `examples/basic/` for manual testing:
  - HTML + JS with inline SVG and controls.

### Changed

- Improved zoom: introduced smooth animation (interpolation via `requestAnimationFrame`) to make zoom less "jumpy".
  - New option `zoomDuration` (ms) to control transition duration.
  - New options for momentum: `zoomInertia`, `zoomInertiaDuration`.
  - New option: `wheelZoomIntensity` to make wheel zoom continuous (less stepped) and smoother.
  - Wheel zoom prefers a continuous path based on delta (`engine.wheelZoomBy`) and applies small inertia after wheel ticks.
- Improved pan: added inertia (small "glide") at the end of drag.
  - New options: `inertiaPan`, `inertiaDuration`, `inertiaFriction`.
- Improved bounds: ability to let content exit the viewport in all directions.
  - New option: `bounds.overflow` (px) or `true` for unlimited overflow (content can exit completely).

### Fixed

- SCSS: resolved `Undefined variable` error in `_mixins.scss` by adding `@use './variables' as *;`.
- Local tooling: added root scripts to run `dev/build` with modern Node (useful in environments with legacy Node on PATH).

### Notes / Known issues

- **pnpm** may block build scripts of dependencies (e.g. `esbuild`, `@parcel/watcher`) if not approved. In case of similar errors, enable scripts (e.g. via `pnpm approve-builds`) or use the root script that forces Node on PATH.
- Future features planned (not included in 0.1.x): pinch-zoom, optional UI controls, advanced animations, React/Vue wrappers.
