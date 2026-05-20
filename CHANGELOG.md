# Changelog
Tutte le modifiche rilevanti a **svg-panzoom** verranno documentate in questo file.

Il formato è ispirato a [Keep a Changelog](https://keepachangelog.com/it-IT/1.1.0/) e il versionamento segue (per quanto applicabile) [Semantic Versioning](https://semver.org/lang/it/).

## [0.3.0] - 2026-05-15
### Fixed
- **`src/index.js`**: `api.zoomIn()`, `api.zoomOut()` e `api.zoomTo()` usavano `origin || null` come default, lasciando l'origin a `null` quando chiamati senza argomenti (es. clic sui pulsanti). L'engine, ricevendo `null`, applicava lo zoom senza aggiustare la pan position, rendendo l'angolo superiore sinistro del contenuto il centro de facto dello zoom.
  - Aggiunto helper `getViewportCenter()` che calcola il centro del container in SVG user units, riutilizzando la stessa conversione CTM-based già usata da `getOriginFromEvent`.
  - `api.zoomIn(origin)`, `api.zoomOut(origin)`, `api.zoomTo(scale, origin)` ora defaultano a `getViewportCenter()` quando `origin` non è fornito (operatore `??`).
  - Il comportamento per wheel zoom e zoom programmatico con origin esplicita è invariato.

### Added
- Esempio di utilizzo per Vue e React.

### Changed
- `package.json`: bumped `version` → `0.3.0`.

---

## [0.2.0] - 2026-05-15
### Fixed
- **`examples/basic/main.js`**: rimossi i valori hardcoded `minZoom: 0.4` e `zoomStep: 1.2` che venivano passati esplicitamente a `createSvgPanZoom()`, sovrascrivendo silenziosamente i `DEFAULT_OPTIONS` definiti in `src/core/state.js`. La priorità `opzione esplicita > DEFAULT_OPTIONS` rendeva inefficace qualsiasi modifica ai valori di default della libreria durante lo sviluppo locale. L'esempio ora eredita `minZoom` e `zoomStep` direttamente dai default (`minZoom: 0.0001`, `zoomStep: 2.0`).

### Changed
- `package.json`: bumped `version` → `0.2.0`.

### Notes
- La priorità delle opzioni segue la regola: **opzione passata esplicitamente > `DEFAULT_OPTIONS` in `state.js`**. Non passare un'opzione equivale a usare il default; passarla esplicitamente la sovrascrive sempre, indipendentemente dal valore nei default.

---

## [0.1.0] - 2026-05-15
### Added
- Setup iniziale come libreria **framework-agnostic** (ES modules) con build in **Vite library mode**:
  - Bundle ESM (`dist/svg-panzoom.js`)
  - Bundle CJS (`dist/svg-panzoom.cjs`)
  - Export CSS (`./style.css`).
- Factory pubblica `createSvgPanZoom(options)` con istanza e API:
  - `zoomIn()`, `zoomOut()`, `zoomTo(scale, origin?)`
  - `panBy(dx, dy)`, `panTo(x, y)`
  - `reset()`, `fit()`, `center()`
  - `getState()`, `getOptions()`
  - `on(event, callback)`, `off(event, callback)`
  - `destroy()`.
- Core separato dalla manipolazione DOM:
  - `src/core/*` gestisce stato, bounds, eventi, engine e logiche di gesture (wheel/pointer).
  - `src/dom/*` gestisce mount, renderer e observer (misure e target viewport).
- Supporto MVP:
  - Pan con drag via **Pointer Events**
  - Zoom via **wheel** con normalizzazione minima (deltaMode)
  - Min/max zoom (`minZoom`, `maxZoom`)
  - Bounds base con padding (`bounds.enabled`, `bounds.padding`)
  - Eventi custom (`change`, `zoom`, `dragstart`, `drag`, `dragend`, `reset`, `fit`, `center`, `measure`, `wheel`).
- SCSS iniziale con convenzione BEM prefisso `spz`:
  - classi base: `.spz`, `.spz__canvas`, `.spz__svg`, `.spz__viewport`, `.spz__controls`, `.spz__button`.
- Esempio `examples/basic/` per test manuale:
  - HTML + JS con SVG inline e controlli.

### Changed
- Zoom migliorato: introdotta animazione smooth (interpolazione via `requestAnimationFrame`) per rendere lo zoom meno “a scatti”.
  - Nuova opzione `zoomDuration` (ms) per controllare la durata della transizione.
  - Nuove opzioni per coda inerziale: `zoomInertia`, `zoomInertiaDuration`.
  - Nuova opzione: `wheelZoomIntensity` per rendere lo zoom wheel continuo (meno a step) e più fluido.
  - Lo zoom wheel preferisce un percorso continuo basato su delta (`engine.wheelZoomBy`) e applica una piccola inerzia dopo i tick della rotellina.
- Pan migliorato: aggiunta inerzia (piccolo “glide”) al termine del drag.
  - Nuove opzioni: `inertiaPan`, `inertiaDuration`, `inertiaFriction`.
- Bounds migliorati: possibilità di far uscire il contenuto dalla viewport in tutte le direzioni.
  - Nuova opzione: `bounds.overflow` (px) oppure `true` per overflow illimitato (contenuto può uscire completamente).

### Fixed
- SCSS: risolto errore `Undefined variable` in `_mixins.scss` aggiungendo `@use './variables' as *;`.
- Tooling locale: aggiunti script di root per eseguire `dev/build` con Node moderno (utile in ambienti con Node legacy sul PATH).

### Notes / Known issues
- **pnpm** può bloccare build scripts di dipendenze (es. `esbuild`, `@parcel/watcher`) se non approvati. In caso di errori simili, abilitare gli script (es. tramite `pnpm approve-builds`) oppure usare lo script root che forza Node in PATH.
- Funzionalità future previste (non incluse in 0.1.x): pinch-zoom, controlli UI opzionali, animazioni avanzate, wrapper React/Vue.
