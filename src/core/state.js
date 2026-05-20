import { clamp } from '../utils/clamp.js';

export const DEFAULT_OPTIONS = Object.freeze({
  element: null, // required
  viewportSelector: null,

  minZoom: 0.0001,
  maxZoom: 10,
  initialZoom: 1,
  zoomStep: 1.25,
  zoomDuration: 200,
  zoomInertia: true,
  zoomInertiaDuration: 600,
  wheelZoomIntensity: 0.003,

  inertiaPan: true,
  inertiaDuration: 300,
  inertiaFriction: 0.92,

  wheelZoom: true,
  panEnabled: true,

  bounds: {
    enabled: true,
    padding: 0,
    overflow: 0 // number (px) or true for unlimited (allow full exit)
  },

  fitOnInit: false,
  centerOnInit: false
});

/**
 * @param {any} opts
 */
export function normalizeOptions(opts = {}) {
  const o = { ...DEFAULT_OPTIONS, ...opts };
  o.bounds = { ...DEFAULT_OPTIONS.bounds, ...(opts.bounds || {}) };
  o.bounds.overflow =
    o.bounds.overflow === true
      ? true
      : Number.isFinite(o.bounds.overflow)
        ? o.bounds.overflow
        : DEFAULT_OPTIONS.bounds.overflow;

  if (!o.element) {
    throw new Error('[svg-panzoom] options.element is required (SVGElement or container Element).');
  }

  o.minZoom = Number.isFinite(o.minZoom) ? o.minZoom : DEFAULT_OPTIONS.minZoom;
  o.maxZoom = Number.isFinite(o.maxZoom) ? o.maxZoom : DEFAULT_OPTIONS.maxZoom;

  // ensure coherent range
  if (o.minZoom > o.maxZoom) {
    const tmp = o.minZoom;
    o.minZoom = o.maxZoom;
    o.maxZoom = tmp;
  }

  o.initialZoom = clamp(
    Number.isFinite(o.initialZoom) ? o.initialZoom : DEFAULT_OPTIONS.initialZoom,
    o.minZoom,
    o.maxZoom
  );

  o.zoomStep = Number.isFinite(o.zoomStep) ? o.zoomStep : DEFAULT_OPTIONS.zoomStep;
  o.zoomDuration = Number.isFinite(o.zoomDuration) ? o.zoomDuration : DEFAULT_OPTIONS.zoomDuration;
  o.zoomInertia = typeof o.zoomInertia === 'boolean' ? o.zoomInertia : DEFAULT_OPTIONS.zoomInertia;
  o.zoomInertiaDuration = Number.isFinite(o.zoomInertiaDuration)
    ? o.zoomInertiaDuration
    : DEFAULT_OPTIONS.zoomInertiaDuration;
  o.wheelZoomIntensity = Number.isFinite(o.wheelZoomIntensity)
    ? o.wheelZoomIntensity
    : DEFAULT_OPTIONS.wheelZoomIntensity;

  o.inertiaPan = typeof o.inertiaPan === 'boolean' ? o.inertiaPan : DEFAULT_OPTIONS.inertiaPan;
  o.inertiaDuration = Number.isFinite(o.inertiaDuration)
    ? o.inertiaDuration
    : DEFAULT_OPTIONS.inertiaDuration;
  o.inertiaFriction = Number.isFinite(o.inertiaFriction)
    ? o.inertiaFriction
    : DEFAULT_OPTIONS.inertiaFriction;

  return o;
}

/**
 * State is mutable, owned by the engine.
 * Coordinates x/y are in screen/CSS px applied via transform.
 * @param {ReturnType<typeof normalizeOptions>} options
 */
export function createState(options) {
  return {
    scale: options.initialZoom,
    x: 0,
    y: 0,

    dragging: false,
    dragPointerId: null,
    dragStart: { x: 0, y: 0 },
    dragStartPan: { x: 0, y: 0 },

    // Measured at runtime
    size: {
      container: { width: 0, height: 0 },
      svg: { width: 0, height: 0 },
      viewportBBox: { x: 0, y: 0, width: 0, height: 0 }
    },

    // Reference values for fit()/center()
    fit: {
      scale: options.initialZoom,
      x: 0,
      y: 0
    }
  };
}
