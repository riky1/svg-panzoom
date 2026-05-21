# Changelog

All notable changes to **svg-panzoom** will be documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/) and versioning follows [Semantic Versioning](https://semver.org/).

## [1.1.1] - 2026-05-21

### Fixed

- Added `touch-action: none` CSS property to enable pinch zoom on mobile devices. Without this property, browsers prevent custom touch gestures in favor of default behaviors (e.g., page zoom, scroll).

## [1.1.0] - 2026-05-21

### Added

- **Pinch zoom support** for touch devices using two-finger gestures
- New `pinchZoom` option (default: `true`) to enable/disable pinch zoom functionality
- Multi-pointer tracking and state management for robust gesture handling
- Proper coordinate conversion for pinch zoom origin (midpoint between fingers)

### Changed

- Gesture handling now supports simultaneous tracking of multiple pointers
- Single-finger pan is automatically cancelled when entering pinch mode
- Event handlers now use `pointercancel` for better cleanup on gesture interruptions

### Fixed

- Improved pointer state transitions when switching between single-finger pan and two-finger pinch
- Better cleanup of gesture state in `destroy()` method
- Touch-action styling now properly set to 'none' for custom gesture handling

---

## [1.0.1] - 2026-05-20

### Security

- **Source code availability**: Full source code is included in the npm package (`src/` directory) for transparency and security verification.
  - All source files are listed in `package.json` `files` field for complete source code distribution.
  - Repository is publicly available at https://github.com/riky1/svg-panzoom for code audit and verification.
  - Security scanners (e.g., socket.dev) can verify package integrity and source transparency.

### Changed

- Package name changed to `@riky1/svg-panzoom` (scoped package on npm).

---

## [1.0.0] - 2026-05-20

### 🎉 First Stable Release

This is the **first stable release** of svg-panzoom. The library is production-ready with a frozen API, comprehensive test coverage, and complete documentation.

### Added

- **Complete TypeScript support**: Full type definitions covering all public API, options, events, and state management.
- **Comprehensive test suite**: Unit and DOM integration tests with Vitest covering core functionality and edge cases.
- **Production-ready API**: Frozen public interface with documented contract for long-term stability.
- **Browser compatibility baseline**: Officially supports Chrome, Firefox, Safari, and iOS Safari (latest versions).
- **Detailed documentation**: 
  - "Understanding Coordinates" guide for SVG user units vs screen pixels.
  - "Limitations & Browser Support" section documenting constraints and future roadmap.
  - Complete API reference with JSDoc inline documentation.
  - Examples for vanilla JS, React, and Vue frameworks.

### No Breaking Changes

- All features from v0.5.0 and earlier versions are fully supported.
- API is backward compatible with previous releases.
- Existing implementations can update without code changes.

### Production Guarantees

- ✅ Frozen API: no breaking changes without major version bump.
- ✅ Robust cleanup: `destroy()` safely removes all listeners and resources.
- ✅ Tested invariants: core engine (zoom/pan/bounds) thoroughly tested.
- ✅ Documentation complete: all features, limitations, and use cases documented.
- ✅ Framework agnostic: works with vanilla JS, React, Vue, and other frameworks.

---

## [0.5.0] - 2026-05-20

### Added

- **TypeScript support**: comprehensive type definitions (`dist/index.d.ts`) for all public API, options, events, and state.
- **Unit tests**: full test suite with Vitest covering core engine, state normalization, utilities, and DOM integration.
- **JSDoc documentation**: inline documentation for all public APIs in `src/index.js`.
- **API stability**: frozen public API with documented contract:
  - Explicit support for **inline SVG in DOM** (no external SVG files or `<object>` elements).
  - Defined browser compatibility baseline (Chrome, Firefox, Safari, iOS Safari).
  - Viewport selection behavior and automatic `<g data-spz-viewport>` generation documented.
- **Documentation enhancements** (README.md):
  - New "Understanding Coordinates" section explaining SVG user units vs screen pixels.
  - New "Limitations & Browser Support" section documenting known limitations, browser compatibility, and planned features.
  - Clarified cleanup and memory management best practices.
- **Release roadmap**: `STABLE_RELEASE_CHECKLIST.md` provides comprehensive checklist for reaching v1.0 stable release (8 sections, 31 items tracking API, robustness, tests, documentation, CI/release).

### Changed

- `package.json`: version bumped to `0.5.0` (first stable release).
- README.md: significantly expanded documentation for user clarity.
- Improved robustness: `destroy()` verified as idempotent with complete cleanup (pointer/wheel/keyboard listeners, ResizeObserver, RAF loop).

### Fixed

- Edge cases in coordinate conversion, bounds validation, and input event handling tested and stabilized.

### Notes

- This is the **first stable release** with frozen API and comprehensive test coverage.
- No breaking changes from previous versions.
- Future releases will maintain API compatibility or clearly document deprecations.
- Full release roadmap for v1.0 available in `STABLE_RELEASE_CHECKLIST.md` (~39% complete, 12/31 items).

---

## [0.4.0] - 2026-05-20

### Added

- GitHub Pages deployment workflow: automated build and deployment on every push to main branch.
- `.gitignore` file with comprehensive exclusions for dependencies, build output, IDE files, and OS-specific files.
- GitHub Pages setup guide (`GITHUB_PAGES_SETUP.md`) with complete instructions.
- New npm scripts: `build:demo` and `dev:demo` for demo-specific development and building.

### Changed

- `vite.config.js`: updated to support dual modes (library build and demo build via `BUILD_MODE` environment variable).
- `package.json`: version bumped to `0.4.0`, added demo-related scripts.
- English translations: README.md and CHANGELOG.md fully translated to English (from Italian).

---

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
