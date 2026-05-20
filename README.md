# svg-panzoom

**Framework-agnostic** library (JavaScript ES Modules) for adding **pan (drag)** and **zoom (wheel)** to inline SVG in the DOM.

Goal: framework-free core, simple API, built as an npm package.

> Status: MVP (v0.3) — drag pan + wheel zoom + base methods + simple bounds.

**Demo:** <a href="https://riky1.github.io/svg-panzoom/" target="_blank" rel="noopener noreferrer">https://riky1.github.io/svg-panzoom/</a>

## Install

```bash
npm i svg-panzoom
```

## Usage

### Vanilla (any framework)

```js
import { createSvgPanZoom } from 'svg-panzoom';
import 'svg-panzoom/style.css';

const instance = createSvgPanZoom({
  element: document.querySelector('#myContainerOrSvg'),
  viewportSelector: '[data-spz-viewport]', // optional
  minZoom: 0.4,
  maxZoom: 6,
  zoomStep: 1.2,
  wheelZoom: true,
  panEnabled: true,
  bounds: { enabled: true, padding: 20 },
  fitOnInit: true,
  centerOnInit: true
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
import { createSvgPanZoom } from 'svg-panzoom';
import 'svg-panzoom/style.css';

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
import { createSvgPanZoom } from 'svg-panzoom';
import 'svg-panzoom/style.css';

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

To apply the transformation to an internal group:

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
- `panEnabled` `boolean` (default `true`)
- `inertiaPan` `boolean` (default `true`)
- `inertiaDuration` `number` (default `300`)
- `inertiaFriction` `number` (default `0.92`)
- `bounds` `{ enabled: boolean, padding: number, overflow?: number | boolean }` (default `{enabled:true,padding:0,overflow:0}`)
- `fitOnInit` `boolean` (default `false`)
- `centerOnInit` `boolean` (default `false`)

### Events

Custom events emitted by the instance:

- `change` → `{ scale, x, y, dragging, size }`
- `zoom` → `{ scale }`
- `reset` → state
- `fit` → state
- `center` → state
- `measure` → updated measurements
- `dragstart` / `drag` / `dragend`
- `wheel`

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
- Pinch zoom (multiple Pointer Events)
- React/Vue wrappers
- Optional UI controls
- Advanced animations / easing
