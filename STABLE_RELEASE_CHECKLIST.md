# Checklist rilascio "prima versione stabile" (GitHub + npm)

Questa checklist serve per arrivare a una **v1 base stabile** di `svg-panzoom`, pronta da pubblicare su **GitHub** e **npm**.


---

## 1) Stabilità API (zero breaking changes)
- [x] Congelare API pubblica: `createSvgPanZoom(options)` + metodi/eventi attuali (nessuna rinomina o cambio semantico).
- [x] Definire e confermare il contratto di supporto:
  - [x] target supportato: **inline SVG nel DOM** (non `<object>`, non SVG esterni).
  - [x] `options.element`: accetta container o `<svg>` (documentare requisiti e differenze).
  - [x] `viewportSelector`: priorità di selezione e cosa succede quando la lib crea automaticamente un `<g data-spz-viewport>`.
- [x] Definire browser minimi supportati (es. Chrome/Edge/Firefox/Safari + iOS Safari) e assumerli come baseline di test.

---

## 2) Robustezza runtime (edge cases + cleanup)
- [x] `destroy()` idempotente (chiamabile più volte) e senza side effect.
- [x] Verificare che `destroy()` rimuova davvero tutto:
  - [x] listener pointer/wheel/keyboard (se presenti).
  - [x] `ResizeObserver`/observer vari.
  - [x] `requestAnimationFrame`/loop di render.
- [x] Gestire correttamente SVG non renderizzato / misure non pronte:
  - [x] `getBBox()` può fallire: definire comportamento (no-op / retry) e renderlo consistente.
  - [x] `getScreenCTM()` può essere `null` o l'inversione può fallire: fallback coerente e testato (Safari/iOS).
- [x] Bounds:
  - [x] nessun "blocco" del pan quando bbox=0 o misure non disponibili.
  - [x] padding/overflow: comportamento atteso chiarito (e testato).
- [x] Input events:
  - [x] wheel: prevenire scroll pagina quando opportuno (policy chiara, listener non duplicati).
  - [x] drag: pointer capture robusto anche se il puntatore esce dal container.
  - [x] multi-pointer: se pinch non supportato, ignorare input extra senza rompere.

---

## 3) Qualità comportamento (consistenza e UX)
- [x] Coerenza coordinate:
  - [x] origine zoom da eventi (mouse) e da chiamate programmatiche (default center) coerenti e prevedibili.
- [x] Inerzia:
  - [x] non deve driftare fuori bounds in modo incontrollato.
  - [x] deve interrompersi su nuove gesture e su `destroy()`.
- [x] `reset()` / `fit()` / `center()`:
  - [x] definire cosa viene resettato (scale/x/y, dragging, inertia, ecc.).
  - [x] definire comportamento di `fit()` (contain/cover) e documentarlo.

---

## 4) Test (minimo per "stabile")
> Obiettivo: coprire invarianti core + regressioni più probabili.

- [x] Aggiungere unit test (consigliato: **Vitest**):
  - [x] `normalizeOptions` (default, min/max, bounds).
  - [x] `engine` (zoomTo/zoomIn/zoomOut, panBy/panTo, bounds invariants).
  - [x] utils (`clamp`, `raf`, ecc.) dove utile.
- [x] Aggiungere test DOM-like (jsdom) per:
  - [x] mount/viewport selection + creazione `<g data-spz-viewport>`.
  - [x] `destroy()` (nessuna eccezione, no listeners "orfani").
- [x] Test manuale ripetibile sulla demo:
  - [x] Chrome (desktop): wheel zoom + drag pan.
  - [x] Firefox (desktop): wheel + drag.
  - [x] Safari (desktop): wheel + drag.
  - [x] iOS Safari: drag ok, nessun crash (wheel non applicabile), compatibilità CTM.

---

## 5) Performance / regressioni
- [x] Renderer:
  - [x] update via `requestAnimationFrame` (batching) e senza "layout thrash" evidente.
  - [x] non scrive DOM se lo stato non cambia (o minimizza le scritture).
- [x] Stress test wheel:
  - [x] nessuna crescita di memoria / listener duplicati.
- [x] (Opzionale) esempio "SVG pesante" per verifica performance (molti nodi).

---

## 6) Documentazione pronta per utenti
- [x] README:
  - [x] sezione "Limitations / Support" (bounds semplice, no pinch, no DOM restore se crea viewport, ecc.).
  - [x] sezione "Understanding Coordinates" per SVG user units e state.x/y.
  - [x] esempi aggiornati e funzionanti (vanilla + React + Vue) e import CSS corretto.
  - [x] **Status aggiornato a v1.0.0 nel README**.
- [x] TypeScript typings:
  - [x] `dist/index.d.ts` esiste e rispecchia API/options/events reali (come dichiarato in `exports`).
- [x] CHANGELOG:
  - [x] entry della release stabile con note (anche "nessuna breaking change" se vero).

---

## 7) CI / qualità release
- [x] Aggiungere scripts di qualità:
  - [x] `test` (Vitest).
  - [x] (opzionale) `lint` e `format`.
- [x] GitHub Actions:
  - [x] install + build.
  - [x] test.
  - [x] (opzionale) publish dry-run / pack.
- [x] Verificare build Vite (library):
  - [x] `dist/svg-panzoom.js` (ESM) — 16.4 kB gzipped
  - [x] `dist/svg-panzoom.cjs` (CJS) — 11.5 kB gzipped
  - [x] `dist/style.css`
  - [x] sourcemaps (inclusi nel build)

---

## 8) Preparazione release GitHub + npm (operativa)
- [x] Allineare versione a v1.0.0 e aggiornare `package.json`.
- [x] `npm pack` (dry-run) verifica: tarball corretto (46.1 kB) e contiene dist/.
- [x] Tag git `v1.0.0` creato e pushato a origin.
- [x] GitHub Release creata con note complete e changelog completo.
- [ ] `npm publish` (eseguire quando pronto per pubblicazione pubblica).
- [x] Demo GitHub Pages già aggiornata e linkata nel README.

**Commit v1.0.0:** `3cc66ff` — release: v1.0.0 - first stable release

---

## Definition of Done (v1.0.0 STABLE) ✅ COMPLETATO

- [x] Nessun bug critico noto su pan/zoom/resize su browser target (Chrome, Firefox, Safari, iOS Safari).
- [x] `destroy()` verificato: nessun errore post-destroy e nessun listener residuo.
- [x] Test suite verde in CI (Vitest unit + DOM integration tests).
- [x] Docs complete e coerenti con implementazione:
  - README aggiornato con status v1.0.0
  - Sezione "Understanding Coordinates" aggiunta
  - Sezione "Limitations & Browser Support" completa
  - Esempi vanilla + React + Vue funzionanti
  - TypeScript types in `dist/index.d.ts`
  - CHANGELOG con entry v1.0.0
- [x] Release pubblicata su GitHub con tag v1.0.0 e GitHub Release creata.
- [ ] Release disponibile su npm (ready for `npm publish`).

---

## Release Notes v1.0.0

**Data:** 20/05/2026

**Commit:** `3cc66ff`

**Tarball:** `svg-panzoom-1.0.0.tgz` (46.1 kB)

**Features:**
- ✅ Frozen API (no breaking changes from v0.5.0)
- ✅ Complete TypeScript support with `dist/index.d.ts`
- ✅ Full test coverage with Vitest (unit + DOM integration tests)
- ✅ Production-ready cleanup and error handling in `destroy()`
- ✅ Comprehensive documentation (README, coordinates guide, API reference, examples)
- ✅ Official browser support: Chrome, Firefox, Safari, iOS Safari
- ✅ Backward compatible with all previous releases

**Breaking Changes:** None ✅

**Migration from v0.5.0:** Drop-in replacement, no code changes required.
