# svg-panzoom

**Framework-agnostic** library (JavaScript ES Modules) for adding **pan (drag)**, **zoom (wheel)**, and **pinch zoom (touch)** to inline SVG in the DOM.

Goal: framework-free core, simple API, built as an npm package.

> Status: **v1.1.13** — Stable release with source code transparency, frozen API, TypeScript support, and comprehensive test coverage.

**Demo:** <a href="https://riky1.github.io/svg-panzoom/" target="_blank" rel="noopener noreferrer">https://riky1.github.io/svg-panzoom/</a>

## Install

```bash
npm i @riky1/svg-panzoom
```

### Source Code Transparency

The full source code is included in every npm package for security verification and audit purposes:

- ✅ **Source code available**: All source files (`src/`) are distributed with the package
- ✅ **Public repository**: Code available at https://github.com/riky1/svg-panzoom for independent verification
- ✅ **Security verification**: Security scanners (e.g., socket.dev) can verify package integrity and source transparency
- ✅ **MIT Licensed**: Open-source license for complete transparency and community trust

## Usage

### Vanilla (any framework)

```js
import { createSvgPanZoom } from '@riky1/svg-panzoom';
import '@riky1/svg-panzoom/style.css';

const instance = createSvgPanZoom({
  element: document.querySelector('#myContainerOrSvg'),
  viewportSelector: '[data-spz-viewport]', // optional
  minZoom: 0.4,
  maxZoom: 6,
  zoomStep: 1.2,
  wheelZoom: true,
  ctrlWheelZoom: true,   // zoom only with Ctrl+scroll; shows hint overlay otherwise
  panEnabled: true,
  bounds: { enabled: true, padding: 20 },
  fitOnInit: true,
  centerOnInit: true,
  keyboardNav: true, // arrow keys pan, +/- zoom (focus container with Tab)
  keyStep: 10        // screen-px per arrow key press
});
```

📁 **Full example:** [`examples/basic/`](./examples/basic/)

### Vue 3 (Composition API)

```vue
<template>
  <div ref="containerRef" style="width: 100%; height: 100%">
    <svg viewBox="0 0 800 450" width="100%" height="100%">
      <g data-spz-viewport="true">
        <!-- SVG content -->
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createSvgPanZoom } from '@riky1/svg-panzoom';
import '@riky1/svg-panzoom/style.css';

const containerRef = ref(null);
const instance = ref(null);

onMounted(() => {
  instance.value = createSvgPanZoom({
    element: containerRef.value,
    viewportSelector: '[data-spz-viewport]'
  });
});

onBeforeUnmount(() => {
  instance.value?.destroy();
});
</script>
```

📁 **Full example:** [`examples/vue/SvgPanZoomDemo.vue`](./examples/vue/SvgPanZoomDemo.vue)

### React (Hooks)

```jsx
import { useRef, useEffect } from 'react';
import { createSvgPanZoom } from '@riky1/svg-panzoom';
import '@riky1/svg-panzoom/style.css';

export default function SvgPanZoom() {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    instanceRef.current = createSvgPanZoom({
      element: containerRef.current,
      viewportSelector: '[data-spz-viewport]'
    });

    return () => {
      instanceRef.current?.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg viewBox="0 0 800 450" width="100%" height="100%">
        <g data-spz-viewport="true">
          {/* SVG content */}
        </g>
      </svg>
    </div>
  );
}
```

📁 **Full example:** [`examples/react/SvgPanZoomDemo.jsx`](./examples/react/SvgPanZoomDemo.jsx)

### Common API Usage

Once the instance is created (using any of the methods above), you can use the following methods and listen to events:

```js
// Methods
instance.zoomIn();
instance.zoomOut();
instance.zoomTo(2);
instance.panBy(10, 0);
instance.panTo(0, 0);
instance.reset();
instance.fit();
instance.center();

// Events
const off = instance.on('change', (state) => console.log(state));
off(); // unsubscribe

// Cleanup
instance.destroy();
```

### Recommended markup (viewport)

To apply the transformation to an internal group add `data-spz-viewport="true"` to the first `<g>` element:

```html
<svg viewBox="0 0 800 450">
  <g data-spz-viewport="true">
    <!-- content -->
  </g>
</svg>
```

If `viewportSelector` is not provided, the library tries to use:
1) `[data-spz-viewport]`
2) the first `<g>`
3) otherwise creates a `<g data-spz-viewport>` and moves elements inside (excluding `<defs>`).

## API

Factory:

- `createSvgPanZoom(options)`

Instance methods:

- `zoomIn(origin?)`
- `zoomOut(origin?)`
- `zoomTo(scale, origin?)`
- `panBy(dx, dy)`
- `panTo(x, y)`
- `reset()`
- `fit()`
- `center()`
- `getState()`
- `getOptions()`
- `on(event, callback)` → returns an `off()` function
- `off(event, callback)`
- `destroy()`

### Options

- `element` (**required**) `Element | SVGSVGElement`: container or inline svg
- `viewportSelector` `string | null`: selector of the viewport (`<g>`) to apply the transform
- `minZoom` `number` (default `0.0001`)
- `maxZoom` `number` (default `10`)
- `initialZoom` `number` (default `1`)
- `zoomStep` `number` (default `1.25`)
- `zoomDuration` `number` (default `200`)
- `zoomInertia` `boolean` (default `true`)
- `zoomInertiaDuration` `number` (default `600`)
- `wheelZoomIntensity` `number` (default `0.003`)
- `wheelZoom` `boolean` (default `true`)
- `ctrlWheelZoom` `boolean` (default `true`) — when `true`, the wheel only zooms if `Ctrl` is held; without `Ctrl` the page scrolls normally and a hint overlay is shown. Set to `false` to restore the classic "wheel always zooms" behaviour.
- `scrollHint` `string | null` (default `null`) — override the hint overlay text with any HTML string (e.g. `'Hold <kbd>Ctrl</kbd> and scroll to zoom'`). Takes priority over all other resolution.
- `scrollHintMessages` `Record<string, string> | null` (default `null`) — extend or override the built-in translation table with your own language codes (e.g. `{ pt: 'Use <kbd>Ctrl</kbd> + scroll para ampliar' }`).
- `panEnabled` `boolean` (default `true`)
- `pinchZoom` `boolean` (default `true`)
- `inertiaPan` `boolean` (default `true`)
- `inertiaDuration` `number` (default `300`)
- `inertiaFriction` `number` (default `0.92`)
- `bounds` `{ enabled: boolean, padding: number, overflow?: number | boolean }` (default `{enabled:true,padding:0,overflow:0}`)
- `fitOnInit` `boolean` (default `false`)
- `centerOnInit` `boolean` (default `false`)
- `keyboardNav` `boolean` (default `true`) — enable keyboard navigation (arrow keys pan, `+`/`-` zoom)
- `keyStep` `number` (default `10`) — pan step in screen-px per arrow key press (automatically scaled for current zoom level)

### Ctrl+Wheel zoom & hint overlay

By default (`ctrlWheelZoom: true`) the mouse wheel **only zooms when `Ctrl` is held**. Without `Ctrl` the wheel event is not consumed and the page scrolls as normal. A non-blocking dark overlay with a localised hint is shown over the map whenever the user scrolls without `Ctrl`; it fades out automatically after 1 second or immediately when `Ctrl` is pressed.

**Localisation** — the hint text is resolved in this priority order:

1. `scrollHint` option (explicit HTML string override)
2. `scrollHintMessages[lang]` (developer-supplied map)
3. Built-in table — `en`, `it`, `de` (uses `Strg`), `fr`, `es` — auto-detected from `<html lang="...">`
4. English fallback

```js
// Default — language auto-detected from <html lang="it"> → Italian hint
createSvgPanZoom({ element: document.querySelector('#map') });

// Add a language not in the built-in table
createSvgPanZoom({
  element: document.querySelector('#map'),
  scrollHintMessages: { pt: 'Use <kbd>Ctrl</kbd> + scroll para ampliar' }
});

// Fully override the hint text
createSvgPanZoom({
  element: document.querySelector('#map'),
  scrollHint: 'Hold <kbd>Ctrl</kbd> and scroll to zoom'
});

// Disable — restore classic "wheel always zooms" behaviour
createSvgPanZoom({
  element: document.querySelector('#map'),
  ctrlWheelZoom: false
});
```

> **Note:** the overlay is injected only when `containerEl` is an HTML element (not an `<svg>` passed directly as `element`).

### Events

Custom events emitted by the instance:

- `keyboardNav` → `{ key, type }` — emitted on each keyboard navigation action (`type`: `'pan'` or `'zoom'`)
- `change` → `{ scale, x, y, dragging, size }`
- `zoom` → `{ scale }`
- `reset` → state
- `fit` → state
- `center` → state
- `measure` → updated measurements
- `dragstart` / `drag` / `dragend`
- `wheel`

## Understanding Coordinates

### State coordinates (x, y, scale)

All coordinates returned by `getState()` and passed to events use **SVG user units** (the viewBox coordinate system), not screen pixels.

```js
const state = instance.getState();
console.log(state);
// {
//   scale: 1.5,        // zoom level (1 = 100%, 2 = 200%)
//   x: 100,            // pan position in SVG user units (viewBox space)
//   y: 50,             // pan position in SVG user units (viewBox space)
//   dragging: false,   // is pointer actively dragging
//   size: { width: 800, height: 450 }  // current viewport dimensions (screen pixels)
// }
```

**Important**: `x` and `y` represent the position of the top-left corner of the viewport in SVG coordinates. When you use methods like `panTo(100, 50)`, you're moving the viewport to show SVG position `(100, 50)` at the top-left.

### Bounds behavior

Bounds are calculated in screen-space and applied as **min/max pan limits**. The `padding` option adds a margin around the viewable content:

- `bounds.enabled: true` — enforces min/max pan boundaries
- `bounds.padding: 20` — adds 20px margin around content edges
- `bounds.overflow: 50` or `true` — allows content to exit viewport by specified pixels or completely

When bounds are tight, panning is prevented from moving outside content; with overflow, you can "overshoot" and see blank space.

## Limitations & Browser Support

### Supported targets

- ✅ **Inline SVG** in the DOM (recommended: with `<g data-spz-viewport>` or first `<g>` as viewport)
- ❌ **External SVG files** (loaded via `<object>` or `<iframe>`)
- ❌ **SVG images** (loaded via `<img>`)

### Browser compatibility

Tested and supported:

- ✅ **Chrome/Edge** (latest)
- ✅ **Firefox** (latest)
- ✅ **Safari** (latest)
- ✅ **iOS Safari** (latest)

### Known limitations and planned features

- **DOM restoration**: When the library creates a `<g data-spz-viewport>` automatically, calling `destroy()` does **not** restore the original DOM structure. Workaround: provide an explicit `viewportSelector` if you need precise control.
- **Pinch zoom**: Two-finger pinch gesture is now supported on touch devices. Requires Pointer Events support and inline SVG in the DOM. Can be disabled with `pinchZoom: false`.
- **Custom easing**: Animation uses linear interpolation; custom easing functions are not yet supported (planned for v2).
- **Bounds**: Current bounds implementation is MVP (screen-space only). Advanced bounds with rotation or skew are not supported.
- **Mouse wheel normalization**: Wheel event delta normalization is minimal (supports `deltaMode` 0/1/2). Advanced wheel behaviors may vary across browsers.

### Cleanup and memory

Always call `destroy()` when the instance is no longer needed (e.g., in component unmount handlers):

```js
// Vue
onBeforeUnmount(() => instance.value?.destroy());

// React
useEffect(() => {
  return () => instanceRef.current?.destroy();
}, []);
```

`destroy()` is idempotent and safe to call multiple times. It removes all listeners, observers, and animation loops to prevent memory leaks.

## Dev

```bash
npm install
npm run dev
```

Open the example: `examples/basic/index.html` (Vite in dev mode also serves SCSS imports).

## Build (library)

```bash
npm run build
```

Output:
- `dist/svg-panzoom.js` (ESM)
- `dist/svg-panzoom.cjs` (CJS)
- `dist/style.css` (compiled CSS)

## Notes / future improvements

- Bounds: currently simple and in screen-space (MVP).
- DOM restoration: if a viewport `<g>` is created, calling `destroy()` does not restore the original structure (v2).
- React/Vue wrappers
- Optional UI controls
- Advanced animations / easing

## License
MIT
