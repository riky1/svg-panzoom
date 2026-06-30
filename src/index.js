import { createEmitter } from './core/events.js';
import { createEngine } from './core/engine.js';
import { createGestures } from './core/gestures.js';
import { createState, normalizeOptions } from './core/state.js';
import { mount } from './dom/mount.js';
import { createObserver } from './dom/observer.js';
import { createRenderer } from './dom/renderer.js';
import './styles/index.scss';

/**
 * @typedef {Object} BoundsConfig
 * @property {boolean} [enabled=true]
 * @property {number} [padding=0]
 * @property {number|boolean} [overflow=0]
 */

/**
 * @typedef {Object} SvgPanZoomOptions
 * @property {Element|SVGSVGElement} element - Required: container or inline SVG
 * @property {string|null} [viewportSelector=null] - CSS selector for viewport <g>
 * @property {number} [minZoom=0.0001] - Minimum zoom level
 * @property {number} [maxZoom=10] - Maximum zoom level
 * @property {number} [initialZoom=1] - Initial zoom level
 * @property {number} [zoomStep=1.25] - Zoom step for zoomIn/zoomOut
 * @property {number} [zoomDuration=200] - Duration of zoom animation (ms)
 * @property {boolean} [zoomInertia=true] - Enable zoom momentum
 * @property {number} [zoomInertiaDuration=600] - Duration of zoom inertia (ms)
 * @property {number} [wheelZoomIntensity=0.003] - Wheel zoom sensitivity
 * @property {boolean} [wheelZoom=true] - Enable mouse wheel zoom
 * @property {boolean} [panEnabled=true] - Enable pan (drag) functionality
 * @property {boolean} [inertiaPan=true] - Enable pan momentum
 * @property {number} [inertiaDuration=300] - Duration of pan inertia (ms)
 * @property {number} [inertiaFriction=0.92] - Friction multiplier for inertia
 * @property {BoundsConfig} [bounds] - Bounds configuration
 * @property {boolean} [fitOnInit=false] - Auto-fit content on init
 * @property {boolean} [centerOnInit=false] - Auto-center content on init
 */

/**
 * @typedef {Object} SvgPanZoomState
 * @property {number} scale - Current zoom level
 * @property {number} x - Current pan X position (CSS px)
 * @property {number} y - Current pan Y position (CSS px)
 * @property {boolean} dragging - Whether drag is active
 * @property {Object} size - Size measurements
 * @property {Object} size.container - Container dimensions
 * @property {number} size.container.width
 * @property {number} size.container.height
 * @property {Object} size.svg - SVG element dimensions
 * @property {number} size.svg.width
 * @property {number} size.svg.height
 * @property {Object} size.viewportBBox - Viewport bbox in SVG coords
 * @property {number} size.viewportBBox.x
 * @property {number} size.viewportBBox.y
 * @property {number} size.viewportBBox.width
 * @property {number} size.viewportBBox.height
 */

/**
 * @typedef {Object} ZoomOrigin
 * @property {number} x - Origin X coordinate
 * @property {number} y - Origin Y coordinate
 */

/**
 * @typedef {(payload?: any) => void} EventCallback
 */

/**
 * @typedef {Object} SvgPanZoomInstance
 * @property {(origin?: ZoomOrigin) => void} zoomIn - Zoom in by zoomStep
 * @property {(origin?: ZoomOrigin) => void} zoomOut - Zoom out by zoomStep
 * @property {(scale: number, origin?: ZoomOrigin) => void} zoomTo - Zoom to exact scale
 * @property {(dx: number, dy: number) => void} panBy - Pan by delta
 * @property {(x: number, y: number) => void} panTo - Pan to absolute position
 * @property {() => void} reset - Reset to initial state
 * @property {() => void} fit - Fit content in viewport
 * @property {() => void} center - Center content in viewport
 * @property {() => SvgPanZoomState} getState - Get current state
 * @property {() => SvgPanZoomOptions} getOptions - Get normalized options
 * @property {(event: string, callback: EventCallback) => () => void} on - Subscribe to event
 * @property {(event: string, callback: EventCallback) => void} off - Unsubscribe from event
 * @property {() => void} destroy - Cleanup instance
 */

/**
 * Create an svg-panzoom instance for pan/zoom control of inline SVG.
 *
 * @param {SvgPanZoomOptions} options - Configuration options
 * @returns {SvgPanZoomInstance} - Public API instance
 * @throws {Error} If options.element is missing or invalid
 *
 * @example
 * import { createSvgPanZoom } from 'svg-panzoom';
 * const instance = createSvgPanZoom({
 *   element: document.querySelector('#myContainer'),
 *   minZoom: 0.4,
 *   maxZoom: 6
 * });
 * instance.zoomIn();
 * instance.panBy(10, 20);
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

    // Letterbox/pillarbox offset: when the container's aspect ratio differs from the
    // SVG viewBox aspect ratio, the browser centres the viewBox inside the SVG element
    // using xMidYMid meet.  ctm.e / ctm.f hold the screen-space origin of SVG (0,0).
    // The offset relative to the container tells us where the viewBox starts inside the
    // container, which is essential for correct fit/center/bounds maths.
    const letterboxX = ctm && Number.isFinite(ctm.e) ? ctm.e - containerRect.left : 0;
    const letterboxY = ctm && Number.isFinite(ctm.f) ? ctm.f - containerRect.top : 0;

    state.size = {
      container: { width: containerRect.width, height: containerRect.height },
      svg: { width: mounted.svgEl.clientWidth, height: mounted.svgEl.clientHeight },
      viewportBBox: { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height },
      /** screen px per SVG user unit (from getScreenCTM) */
      svgPxRatio,
      /** px offset of SVG viewBox origin from container left edge (letterbox/pillarbox) */
      letterboxX,
      /** px offset of SVG viewBox origin from container top edge (letterbox/pillarbox) */
      letterboxY
    };

    engine.setMeasurements(state.size);
  }

  // renderer needs engine, engine needs requestRender.
  /** @type {number | null} */
  let resizeRafId = null;
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
      // Defer measurement to the next animation frame.
      // ResizeObserver (and window.resize) can fire before the browser has
      // finished recalculating layout transforms, so getScreenCTM() may still
      // return the old matrix.  If we measure immediately we get a stale
      // svgPxRatio that makes fit/center math drift — typically placing the
      // content at the bottom-right corner instead of the centre.
      // Waiting one rAF guarantees a fresh layout snapshot.
      if (resizeRafId != null) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        measure();
        if (normalized.fitOnInit) engine.fit();
        if (normalized.centerOnInit) engine.center();
      });
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

  // Do a synchronous measure + render so there is something on screen immediately.
  // Then re-measure + fit/center on the next animation frame: at script-execution
  // time the browser may not have committed the first CSS layout yet, so
  // getScreenCTM() can return a stale/wrong matrix.  Deferring one rAF guarantees
  // a fresh layout snapshot and prevents the content from appearing at the wrong
  // position (typically bottom-right) on the initial load.
  measure();
  renderer.requestRender();

  if (normalized.fitOnInit || normalized.centerOnInit) {
    requestAnimationFrame(() => {
      measure();
      if (normalized.fitOnInit) engine.fit();
      if (normalized.centerOnInit) engine.center();
    });
  }

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

      if (resizeRafId != null) {
        cancelAnimationFrame(resizeRafId);
        resizeRafId = null;
      }
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
