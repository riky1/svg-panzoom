# svg-panzoom

Libreria **framework-agnostic** (JavaScript ES Modules) per aggiungere **pan (drag)** e **zoom (wheel)** a SVG inline nel DOM.

Obiettivo: core senza dipendenze da framework, API semplice, build come pacchetto npm.

> Stato: MVP (v0.1) — drag pan + wheel zoom + metodi base + bounds semplici.

## Install

```bash
npm i svg-panzoom
```

## Usage

### Vanilla (qualsiasi framework)

```js
import { createSvgPanZoom } from 'svg-panzoom';
import 'svg-panzoom/style.css';

const instance = createSvgPanZoom({
  element: document.querySelector('#myContainerOrSvg'),
  viewportSelector: '[data-spz-viewport]', // opzionale
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

📁 **Esempio completo:** [`examples/basic/`](./examples/basic/)

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

📁 **Esempio completo:** [`examples/vue/SvgPanZoomDemo.vue`](./examples/vue/SvgPanZoomDemo.vue)

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

📁 **Esempio completo:** [`examples/react/SvgPanZoomDemo.jsx`](./examples/react/SvgPanZoomDemo.jsx)

### Common API Usage

Una volta creata l'istanza (con uno qualsiasi dei metodi sopra), puoi usare i seguenti metodi e ascoltare gli eventi:

```js
// Metodi
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

### Markup consigliato (viewport)

Per applicare la trasformazione ad un gruppo interno:

```html
<svg viewBox="0 0 800 450">
  <g data-spz-viewport="true">
    <!-- contenuto -->
  </g>
</svg>
```

Se `viewportSelector` non viene fornito, la libreria prova a usare:
1) `[data-spz-viewport]`
2) il primo `<g>`
3) altrimenti crea un `<g data-spz-viewport>` e sposta dentro gli elementi (escludendo `<defs>`).

## API

Factory:

- `createSvgPanZoom(options)`

Metodi istanza:

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
- `on(event, callback)` → ritorna una funzione `off()`
- `off(event, callback)`
- `destroy()`

### Options

- `element` (**required**) `Element | SVGSVGElement`: container o svg inline
- `viewportSelector` `string | null`: selettore del viewport (`<g>`) su cui applicare la transform
- `minZoom` `number` (default `0.2`)
- `maxZoom` `number` (default `10`)
- `initialZoom` `number` (default `1`)
- `zoomStep` `number` (default `1.2`)
- `wheelZoom` `boolean` (default `true`)
- `panEnabled` `boolean` (default `true`)
- `bounds` `{ enabled: boolean, padding: number }` (default `{enabled:true,padding:0}`)
- `fitOnInit` `boolean` (default `false`)
- `centerOnInit` `boolean` (default `false`)

### Events

Eventi custom (emessi dall’istanza):

- `change` → `{ scale, x, y, dragging, size }`
- `zoom` → `{ scale }`
- `reset` → state
- `fit` → state
- `center` → state
- `measure` → misure aggiornate
- `dragstart` / `drag` / `dragend`
- `wheel`

## Dev

```bash
npm install
npm run dev
```

Apri l’esempio: `examples/basic/index.html` (Vite in dev serve anche gli import SCSS).

## Build (libreria)

```bash
npm run build
```

Output:
- `dist/svg-panzoom.js` (ESM)
- `dist/svg-panzoom.cjs` (CJS)
- `dist/style.css` (CSS compilato)

## Note / miglioramenti futuri

- Bounds: attualmente semplici e in screen-space (MVP).
- Ripristino DOM: se viene creato un viewport `<g>`, al `destroy()` non viene ripristinata la struttura originale (v2).
- Pinch zoom (Pointer Events multipli)
- Wrapper React/Vue
- Controlli UI opzionali
- Animazioni / easing
