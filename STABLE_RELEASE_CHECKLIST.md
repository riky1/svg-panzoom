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
- [ ] `destroy()` idempotente (chiamabile più volte) e senza side effect.
- [ ] Verificare che `destroy()` rimuova davvero tutto:
  - [ ] listener pointer/wheel/keyboard (se presenti).
  - [ ] `ResizeObserver`/observer vari.
  - [ ] `requestAnimationFrame`/loop di render.
- [ ] Gestire correttamente SVG non renderizzato / misure non pronte:
  - [ ] `getBBox()` può fallire: definire comportamento (no-op / retry) e renderlo consistente.
  - [ ] `getScreenCTM()` può essere `null` o l'inversione può fallire: fallback coerente e testato (Safari/iOS).
- [ ] Bounds:
  - [ ] nessun "blocco" del pan quando bbox=0 o misure non disponibili.
  - [ ] padding/overflow: comportamento atteso chiarito (e testato).
- [ ] Input events:
  - [ ] wheel: prevenire scroll pagina quando opportuno (policy chiara, listener non duplicati).
  - [ ] drag: pointer capture robusto anche se il puntatore esce dal container.
  - [ ] multi-pointer: se pinch non supportato, ignorare input extra senza rompere.

---

## 3) Qualità comportamento (consistenza e UX)
- [ ] Coerenza coordinate:
  - [ ] origine zoom da eventi (mouse) e da chiamate programmatiche (default center) coerenti e prevedibili.
- [ ] Inerzia:
  - [ ] non deve driftare fuori bounds in modo incontrollato.
  - [ ] deve interrompersi su nuove gesture e su `destroy()`.
- [ ] `reset()` / `fit()` / `center()`:
  - [ ] definire cosa viene resettato (scale/x/y, dragging, inertia, ecc.).
  - [ ] definire comportamento di `fit()` (contain/cover) e documentarlo.

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
- [ ] Test manuale ripetibile sulla demo:
  - [ ] Chrome (desktop): wheel zoom + drag pan.
  - [ ] Firefox (desktop): wheel + drag.
  - [ ] Safari (desktop): wheel + drag.
  - [ ] iOS Safari: drag ok, nessun crash (wheel non applicabile), compatibilità CTM.

---

## 5) Performance / regressioni
- [ ] Renderer:
  - [ ] update via `requestAnimationFrame` (batching) e senza "layout thrash" evidente.
  - [ ] non scrive DOM se lo stato non cambia (o minimizza le scritture).
- [ ] Stress test wheel:
  - [ ] nessuna crescita di memoria / listener duplicati.
- [ ] (Opzionale) esempio "SVG pesante" per verifica performance (molti nodi).

---

## 6) Documentazione pronta per utenti
- [ ] README:
  - [ ] sezione "Limitations / Support" (bounds semplice, no pinch, no DOM restore se crea viewport, ecc.).
  - [ ] chiarire unità di misura di `state.x/y` (SVG user units).
  - [ ] esempi aggiornati e funzionanti (vanilla + React + Vue) e import CSS corretto.
- [x] TypeScript typings:
  - [x] `dist/index.d.ts` esiste e rispecchia API/options/events reali (come dichiarato in `exports`).
- [x] CHANGELOG:
  - [x] entry della release stabile con note (anche "nessuna breaking change" se vero).

---

## 7) CI / qualità release
- [ ] Aggiungere scripts di qualità:
  - [ ] `test` (Vitest).
  - [ ] (opzionale) `lint` e `format`.
- [ ] GitHub Actions:
  - [ ] install + build.
  - [ ] test.
  - [ ] (opzionale) publish dry-run / pack.
- [ ] Verificare build Vite (library):
  - [ ] `dist/svg-panzoom.js` (ESM)
  - [ ] `dist/svg-panzoom.cjs` (CJS)
  - [ ] `dist/style.css`
  - [ ] sourcemaps (se desiderate)

---

## 8) Preparazione release GitHub + npm (operativa)
- [x] Allineare versione (cartella "0.5.0" vs `package.json` `0.4.0`) e decidere target (es. `1.0.0`).
- [ ] `npm pack` (o `pnpm pack`) produce un tarball corretto e contiene solo `dist/`.
- [ ] Tag git `vX.Y.Z` creato e pushato.
- [ ] GitHub Release creata (note + changelog).
- [ ] `npm publish` eseguito (con 2FA se attiva) e verificato su npm.
- [ ] Demo GitHub Pages aggiornata e linkata nel README.

---

## Definition of Done (v1 stabile)
- [ ] Nessun bug critico noto su pan/zoom/resize su browser target.
- [ ] `destroy()` verificato: nessun errore post-destroy e nessun listener residuo.
- [ ] Test suite minima verde in CI.
- [ ] Docs complete e coerenti con implementazione.
- [ ] Release pubblicata su GitHub + npm con versione e changelog coerenti.
