import { createEmitter } from './core/events.js';
import { createEngine } from './core/engine.js';
import { createGestures } from './core/gestures.js';
import { createState, normalizeOptions } from './core/state.js';
import { mount } from './dom/mount.js';
import { createObserver } from './dom/observer.js';
import { createRenderer } from './dom/renderer.js';

/**
 * Public factory
 * @param {import('./core/state.js').DEFAULT_OPTIONS & any} options
 */
export function createSvgPanZoom(options) {
  const normalized = normalizeOptions(options);
  const emitter = createEmitter();

  const mounted = mount({
    element: normalized.element,
    viewportSelector: normalized.viewportSelector
  });

  const state = createState(normalized);

  function measure() {
    const containerRect = mounted.containerEl.getBoundingClientRect();

    // viewport bbox in SVG user units
    let bbox = { x: 0, y: 0, width: 0, height: 0 };
    try {
      bbox = mounted.viewportEl.getBBox();
    } catch {
      // getBBox can throw if element not rendered yet
    }

    // SVG screen-to-user-unit ratio: how many screen pixels correspond to 1 SVG user unit.
    // This is non-1 when the SVG has a viewBox that differs in aspect/size from its CSS size.
    // We need this to convert between CSS px (container, pointer events) and SVG user units
    // (the coordinate space used by the <g> transform).
    const ctm = mounted.svgEl.getScreenCTM?.();
    const svgPxRatio = ctm && Number.isFinite(ctm.a) && ctm.a > 0 ? ctm.a : 1;

    state.size = {
      container: { width: containerRect.width, height: containerRect.height },
      svg: { width: mounted.svgEl.clientWidth, height: mounted.svgEl.clientHeight },
      viewportBBox: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
      /** screen px per SVG user unit (from getScreenCTM) */
      svgPxRatio
    };

    engine.setMeasurements(state.size);
  }

  // renderer needs engine, engine needs requestRender.
  let renderer = null;

  const engine = createEngine({
    state,
    options: normalized,
    emit: (event, payload) => emitter.emit(event, payload),
    requestRender: () => renderer?.requestRender()
  });

  renderer = createRenderer({
    viewportEl: mounted.viewportEl,
    engine
  });

  const observer = createObserver({
    element: mounted.containerEl,
    onResize: () => {
      measure();
      if (normalized.fitOnInit) engine.fit();
      if (normalized.centerOnInit) engine.center();
    }
  });

  function getOriginFromEvent(e) {
    // The SVG transform `translate(x y) scale(s)` operates in SVG *user units*, not CSS pixels.
    // If the SVG has a viewBox the two spaces differ, so we must convert the cursor position
    // from screen coordinates into SVG root user coordinates before passing it to the engine.
    const ctm = mounted.svgEl.getScreenCTM?.();
    if (ctm) {
      try {
        const inv = ctm.inverse();
        const pt = new DOMPoint(e.clientX, e.clientY);
        const svgPt = pt.matrixTransform(inv);
        return { x: svgPt.x, y: svgPt.y };
      } catch {
        // fallthrough to fallback
      }
    }
    // Fallback: assume 1:1 (no viewBox scaling)
    const rect = mounted.svgEl.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  /**
   * Returns the center of the container in SVG user units.
   * Used as the default zoom origin for programmatic zoomIn/zoomOut/zoomTo calls
   * that do not specify an explicit origin (e.g. button clicks).
   * Reuses the same CTM-based conversion as getOriginFromEvent so both are consistent.
   */
  function getViewportCenter() {
    const rect = mounted.containerEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const ctm = mounted.svgEl.getScreenCTM?.();
    if (ctm) {
      try {
        const inv = ctm.inverse();
        const pt = new DOMPoint(cx, cy);
        const svgPt = pt.matrixTransform(inv);
        return { x: svgPt.x, y: svgPt.y };
      } catch {
        // fallthrough
      }
    }
    // Fallback: no viewBox scaling
    const svgRect = mounted.svgEl.getBoundingClientRect();
    return { x: cx - svgRect.left, y: cy - svgRect.top };
  }

  const gestures = createGestures({
    containerEl: mounted.containerEl,
    options: normalized,
    engine,
    emitter,
    getOriginFromEvent
  });

  // init
  observer.bind();
  gestures.bind();
  measure();

  if (normalized.fitOnInit) engine.fit();
  if (normalized.centerOnInit) engine.center();

  // initial render
  renderer.requestRender();

  let destroyed = false;

  const api = {
    zoomIn(origin) {
      // Default origin: center of the viewport so zoom feels "in place" for button clicks.
      engine.zoomIn(origin ?? getViewportCenter());
    },
    zoomOut(origin) {
      engine.zoomOut(origin ?? getViewportCenter());
    },
    zoomTo(scale, origin) {
      engine.zoomTo(scale, origin ?? getViewportCenter());
    },
    panBy(dx, dy) {
      engine.panBy(dx, dy);
    },
    panTo(x, y) {
      engine.panTo(x, y);
    },
    reset() {
      engine.reset();
    },
    fit() {
      engine.fit();
    },
    center() {
      engine.center();
    },
    getState() {
      return engine.getState();
    },
    getOptions() {
      return engine.getOptions();
    },
    on(event, cb) {
      return emitter.on(event, cb);
    },
    off(event, cb) {
      return emitter.off(event, cb);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;

      gestures.unbind();
      observer.unbind();
      renderer.destroy();
      emitter.clear();
      mounted.destroy();
    }
  };

  return api;
}

export default createSvgPanZoom;
