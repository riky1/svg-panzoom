# Changelog

All notable changes to **svg-panzoom** will be documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/) and versioning follows [Semantic Versioning](https://semver.org/).



## [1.1.12] - 2026-07-13

### Fixed

- **Keyboard indicator CSS missing from `dist/style.css`**: styles for `.spz__keyboard-indicator` and `.spz:focus-visible` were added to `src/styles/svg-panzoom.scss` but the library build entry point is `src/styles/index.scss` (imported by `src/index.js`). The keyboard navigation CSS rules have been added to `index.scss` so they are correctly included in the compiled `dist/style.css`. Consumers must import `@riky1/svg-panzoom/style.css` to get the focus indicator styles.

---

## [1.1.11] - 2026-07-13

### Added

- **Keyboard navigation** (`keyboardNav`, `keyStep` options):
  - Arrow keys pan the view with smooth acceleration and inertial damping (frame-rate independent physics via `requestAnimationFrame`).
  - `+` / `=` zoom in; `-` zooms out, centred on the viewport.
  - New option `keyboardNav` `boolean` (default `true`) — enable/disable the feature entirely.
  - New option `keyStep` `number` (default `10`) — pan step in screen-px per arrow key press, automatically scaled for the current zoom level so visual movement is always consistent.
  - The container receives `tabindex="0"` automatically (only if not already set) to make it focusable.
  - A centre crosshair indicator (`.spz__keyboard-indicator`) is displayed using the CSS `:focus-visible` pseudo-class: it appears only when focus is received via keyboard (Tab), not on mouse click.
  - New event `keyboardNav` → `{ key, type }` emitted on each key action (`type`: `'pan'` | `'zoom'`).
  - `destroy()` cleans up all keyboard event listeners and cancels any running animation loop.

### Changed

- Basic example (`examples/basic/main.js`) updated to include `keyboardNav: true` and `keyStep: 10` options and log the `keyboardNav` event.
- README.md updated: `keyboardNav` and `keyStep` added to the Options table; `keyboardNav` event added to the Events list; Vanilla usage example updated; version badge updated to v1.1.11.

---

## [1.1.10] - 2026-07-02

### Fixed

- **`reset()` now restores the full initial view** (scale + position), not just the zoom level.
  Previously, `reset()` always restored `{ scale: initialZoom, x: 0, y: 0 }`, placing the content
  at the top-left corner even when `centerOnInit: true` or `fitOnInit: true` were set.
  - Added `state.initial` (replaces the internal `state.fit` reference used by `reset()`) to hold
    the complete transform snapshot captured after initialization completes.
  - Added `engine.saveInitialState()` — snapshots `{ scale, x, y }` into `state.initial`; called
    in `index.js` after `fitOnInit`/`centerOnInit` are applied, and again on every resize so the
    reset target stays correct for the current viewport size.
  - `fit()` now writes to `state.initial` (same object) so calling `fit()` programmatically still
    makes `reset()` return to the fitted view.

### Changed

- **Basic example redesigned** (`examples/basic/`):
  - New two-column layout: info panel on the left, live demo on the right.
  - Info panel includes a short description of the library, interaction hints
    (drag / scroll / pinch / toolbar buttons), and three syntax-highlighted code blocks
    (Install, HTML markup, JavaScript) showing the minimum code needed to reproduce the example.
  - Added GitHub repository link with inline GitHub mark icon.
  - On phone screens (≤ 600 px) the demo appears above the info panel.
  - `main.js` comments translated to English.

---

## [1.1.9] - 2026-06-30

### Fixed

- **Content centering when container and SVG `viewBox` have different aspect ratios**: when the aspect ratios differ the browser adds letterbox/pillarbox padding (`xMidYMid meet`). The previous `fit()`, `center()` and bounds logic ignored the resulting offset (`ctm.e`/`ctm.f`), placing content at the bottom-right instead of the centre.
  - `measure()` now stores `letterboxX`/`letterboxY` (offset of SVG origin from container edge in CSS px).
  - `computeFit()`, `center()` and `applyBounds()` use these values to correctly compute the container centre and pan limits in SVG user units.
  - Initial `fit`/`center` is deferred to `requestAnimationFrame` to ensure `getScreenCTM()` is up to date at first render and on every resize.

## [1.1.8] - 2026-05-25

### Documentation

- Some digits.

## [1.1.7] - 2026-05-21

### Fixed

- **Examples package name correction**: Fixed incorrect package name in all example files and documentation
  - Updated `examples/vue/SvgPanZoomDemo.vue` to use correct package name `@riky1/svg-panzoom` instead of `svg-panzoom`
  - Updated `examples/react/SvgPanZoomDemo.jsx` to use correct package name `@riky1/svg-panzoom` instead of `svg-panzoom`
  - Updated `examples/basic/main.js` to use local source files (`../../src/index.js`) for development testing with Vite dev server
  - Updated all code examples in README.md to use correct scoped package name `@riky1/svg-panzoom`

### Documentation

- Clarified that `examples/basic/` requires Vite dev server (`npm run dev`) to process SCSS imports, not Live Server
- Examples now correctly demonstrate the difference between:
  - Development testing (using local source files in `/examples/basic/`)
  - External project integration (using published npm package `@riky1/svg-panzoom` in Vue/React examples)

## [1.1.6] - 2026-05-21

### Added

- **TypeScript declaration file**: Added comprehensive TypeScript type definitions (`dist/index.d.ts`)
  - Full type definitions for all public API methods and configuration options
  - Proper TypeScript support for better IDE autocompletion and type safety
  - JSDoc comments with usage examples for improved developer experience

### Fixed

- Resolved TypeScript import warning when using the library in TypeScript projects

## [1.1.5] - 2026-05-21

### Fixed

- **CSS export now properly generated**: Fixed missing `style.css` file in `dist/` folder. The package was configured to export `./style.css` via `package.json` exports field, but the build process was not generating the CSS file. This caused import errors when using `import 'svg-panzoom/style.css'` in external applications.

### Changed

- Updated Vite configuration to properly extract and output CSS from SCSS source files to `dist/style.css`
- Created dedicated CSS entry point at `src/styles/index.scss` 
- Modified `src/index.js` to import SCSS styles, ensuring CSS is bundled during library build
- Added `assetFileNames` configuration to rollup output to ensure consistent CSS filename

## [1.1.4] - 2026-05-21

### Changed

- Updated README.md

## [1.1.3] - 2026-05-21

### Changed

- Updated README.md with current version reference (v1.1.2 → v1.1.3)

## [1.1.2] - 2026-05-21

### Fixed

- **Improved pinch zoom responsiveness and fluidity on touch devices**: Pinch zoom now updates in real-time during the gesture, providing smooth and continuous feedback. The previous implementation used animated zoom transitions (`zoomTo`) which delayed visual updates until the end of the gesture. The new implementation uses instant scale updates (`setScale`) for immediate response to finger movements.

### Changed

- Added `setScale(scale, origin)` method to engine for instant zoom updates without animation (optimized for high-frequency pinch zoom events)
- Pinch zoom gesture now uses `setScale()` instead of `zoomTo()` for fluid real-time updates

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
