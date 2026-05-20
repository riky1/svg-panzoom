import { clamp } from '../utils/clamp.js';
import { applyBounds } from './bounds.js';

/**
 * Core engine: pure-ish logic (no DOM listeners).
 * It expects measurements to be kept up to date by the DOM layer (renderer/observer).
 *
 * @param {{
 *  state: any,
 *  options: any,
 *  emit: (event:string, payload?:any)=>void,
 *  requestRender: ()=>void
 * }} ctx
 */
export function createEngine(ctx) {
  const { state, options, emit, requestRender } = ctx;

  // Smooth zoom animation state (MVP)
  /** @type {number | null} */
  let zoomAnimRaf = null;
  /** @type {number} */
  let zoomAnimStart = 0;
  /** @type {number} */
  let zoomAnimFrom = 1;
  /** @type {number} */
  let zoomAnimTo = 1;
  /** @type {{x:number,y:number} | null} */
  let zoomAnimOrigin = null;

  // Zoom inertia (keeps a small momentum after wheel ticks stop)
  /** @type {number | null} */
  let zoomInertiaRaf = null;
  /** @type {number} */
  let zoomInertiaLast = 0;
  /** @type {number} */
  let zoomInertiaEnd = 0;
  /** @type {number} */
  let zoomVelocity = 0; // scale delta per ms
  /** @type {{x:number,y:number} | null} */
  let zoomInertiaOrigin = null;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function stopZoomAnimation() {
    if (zoomAnimRaf != null) cancelAnimationFrame(zoomAnimRaf);
    zoomAnimRaf = null;
  }

  function stopZoomInertia() {
    if (zoomInertiaRaf != null) cancelAnimationFrame(zoomInertiaRaf);
    zoomInertiaRaf = null;
    zoomVelocity = 0;
  }

  function setPan(nextX, nextY) {
    const bounded = applyBounds(
      { x: nextX, y: nextY },
      { scale: state.scale },
      state.size,
      options.bounds
    );

    const changed = bounded.x !== state.x || bounded.y !== state.y;
    state.x = bounded.x;
    state.y = bounded.y;

    if (changed) {
      emit('change', getPublicState());
      requestRender();
    }
  }

  /**
   * Zoom towards an origin point expressed in container pixels.
   * Keeps the origin fixed on screen.
   * @param {number} nextScale
   * @param {{x:number,y:number} | null} originPx
   */
  function setZoomInstant(nextScale, originPx = null) {
    const prevScale = state.scale;
    const clamped = clamp(nextScale, options.minZoom, options.maxZoom);

    if (clamped === prevScale) return;

    if (originPx && Number.isFinite(originPx.x) && Number.isFinite(originPx.y)) {
      // Keep the point under the cursor stable in SVG user-unit space.
      //
      // Renderer applies: translate(x y) scale(scale)  [all SVG user units]
      // => svgUserPos = pan + content * scale
      //
      // Content point under cursor before zoom:
      //   c = (origin - pan) / prevScale
      // After zoom we want: origin = newPan + c * clamped
      // => newPan = origin - c * clamped
      // => newPan = origin - ((origin - pan) / prevScale) * clamped
      //
      // origin (originPx) must already be in SVG user units (converted by getOriginFromEvent).
      const ratio = clamped / prevScale;
      state.x = originPx.x - (originPx.x - state.x) * ratio;
      state.y = originPx.y - (originPx.y - state.y) * ratio;
    }

    state.scale = clamped;

    // apply bounds after zoom
    const bounded = applyBounds(
      { x: state.x, y: state.y },
      { scale: state.scale },
      state.size,
      options.bounds
    );
    state.x = bounded.x;
    state.y = bounded.y;

    emit('zoom', { scale: state.scale });
    emit('change', getPublicState());
    requestRender();
  }

  function startZoomInertia(originPx) {
    if (!options.zoomInertia) return;
    const durationMs = Math.max(0, Number(options.zoomInertiaDuration) || 0);
    if (durationMs === 0) return;
    if (Math.abs(zoomVelocity) < 0.00001) return;

    stopZoomInertia();
    zoomInertiaOrigin = originPx;
    zoomInertiaLast = performance.now();
    zoomInertiaEnd = zoomInertiaLast + durationMs;

    // exponential decay to zero over duration
    // smaller => longer tail / stronger inertia
    const decay = 0.0006;
    const tick = () => {
      const now = performance.now();
      const dt = now - zoomInertiaLast;
      zoomInertiaLast = now;

      // apply velocity
      const next = state.scale + zoomVelocity * dt;
      setZoomInstant(next, zoomInertiaOrigin);

      // decay velocity
      zoomVelocity *= Math.exp(-decay * dt);

      if (now < zoomInertiaEnd && Math.abs(zoomVelocity) > 0.00001) {
        zoomInertiaRaf = requestAnimationFrame(tick);
      } else {
        zoomInertiaRaf = null;
        zoomVelocity = 0;
      }
    };

    zoomInertiaRaf = requestAnimationFrame(tick);
  }

  function setZoomSmooth(targetScale, originPx = null) {
    const clamped = clamp(targetScale, options.minZoom, options.maxZoom);
    if (clamped === state.scale) return;

    // Each wheel tick sets a new target; keep a small momentum.
    // We stop inertia while actively animating to a target.
    stopZoomInertia();

    // restart animation from current state (supports repeated wheel ticks)
    stopZoomAnimation();
    zoomAnimStart = performance.now();
    zoomAnimFrom = state.scale;
    zoomAnimTo = clamped;
    zoomAnimOrigin = originPx;

    const durationMs = Math.max(0, Number(options.zoomDuration) || 0);

    // update velocity estimate from this impulse (scale/ms)
    const denom = Math.max(1, durationMs);
    zoomVelocity = (zoomAnimTo - zoomAnimFrom) / denom;

    if (durationMs === 0) {
      setZoomInstant(zoomAnimTo, zoomAnimOrigin);
      startZoomInertia(zoomAnimOrigin);
      return;
    }

    const tick = () => {
      const t = (performance.now() - zoomAnimStart) / durationMs;
      const tt = t >= 1 ? 1 : t <= 0 ? 0 : t;
      const eased = easeOutCubic(tt);
      const next = zoomAnimFrom + (zoomAnimTo - zoomAnimFrom) * eased;

      setZoomInstant(next, zoomAnimOrigin);

      if (tt < 1) {
        zoomAnimRaf = requestAnimationFrame(tick);
      } else {
        zoomAnimRaf = null;
        startZoomInertia(zoomAnimOrigin);
      }
    };

    zoomAnimRaf = requestAnimationFrame(tick);
  }

  function zoomIn(originPx = null) {
    setZoomSmooth(state.scale * options.zoomStep, originPx);
  }

  function zoomOut(originPx = null) {
    setZoomSmooth(state.scale / options.zoomStep, originPx);
  }

  /**
   * Continuous wheel zoom: dy in pixels (normalized), dy<0 zoom in, dy>0 zoom out.
   * Produces a smooth scale curve (exponential) rather than discrete steps.
   * @param {number} dy
   * @param {{x:number,y:number} | null} originPx
   */
  function wheelZoomBy(dy, originPx = null) {
    // k controls sensitivity: smaller => slower/more fluid
    const k = Number.isFinite(options.wheelZoomIntensity) ? options.wheelZoomIntensity : 0.002;
    // exp(-dy*k): dy>0 => factor<1 (zoom out), dy<0 => factor>1 (zoom in)
    const factor = Math.exp(-dy * k);
    const target = state.scale * factor;
    setZoomSmooth(target, originPx);
  }

  function panBy(dx, dy) {
    setPan(state.x + dx, state.y + dy);
  }

  function panTo(x, y) {
    setPan(x, y);
  }

  function reset() {
    stopZoomAnimation();
    stopZoomInertia();
    // Restore the reference state captured the last time fit() was called
    // (or the initial state if fit() was never called: { scale: initialZoom, x:0, y:0 }).
    state.scale = state.fit.scale;
    state.x = state.fit.x;
    state.y = state.fit.y;
    emit('reset', getPublicState());
    emit('change', getPublicState());
    requestRender();
  }

  function computeFit() {
    const { container, viewportBBox, svgPxRatio = 1 } = state.size;
    if (!container.width || !container.height || !viewportBBox.width || !viewportBBox.height) {
      return { scale: state.scale, x: state.x, y: state.y };
    }

    // state.x / state.y are in SVG user units, so all geometry must be in the same space.
    // container is in CSS px → convert to SVG user units by dividing by svgPxRatio.
    const containerSvgW = container.width / svgPxRatio;
    const containerSvgH = container.height / svgPxRatio;

    const scaleX = containerSvgW / viewportBBox.width;
    const scaleY = containerSvgH / viewportBBox.height;
    const scale = clamp(Math.min(scaleX, scaleY), options.minZoom, options.maxZoom);

    // Center content. viewportBBox.x/y handles cases where content doesn't start at (0,0).
    const contentW = viewportBBox.width * scale;
    const contentH = viewportBBox.height * scale;
    const x = (containerSvgW - contentW) / 2 - viewportBBox.x * scale;
    const y = (containerSvgH - contentH) / 2 - viewportBBox.y * scale;

    return { scale, x, y };
  }

  function fit() {
    stopZoomAnimation();
    stopZoomInertia();
    const next = computeFit();
    state.fit = { ...next };
    state.scale = next.scale;
    state.x = next.x;
    state.y = next.y;

    const bounded = applyBounds(
      { x: state.x, y: state.y },
      { scale: state.scale },
      state.size,
      options.bounds
    );
    state.x = bounded.x;
    state.y = bounded.y;

    emit('fit', getPublicState());
    emit('change', getPublicState());
    requestRender();
  }

  function center() {
    stopZoomAnimation();
    stopZoomInertia();
    const { container, viewportBBox, svgPxRatio = 1 } = state.size;
    if (!container.width || !container.height || !viewportBBox.width || !viewportBBox.height) return;

    // Convert container to SVG user units (same coordinate space as state.x/state.y).
    const containerSvgW = container.width / svgPxRatio;
    const containerSvgH = container.height / svgPxRatio;

    const contentW = viewportBBox.width * state.scale;
    const contentH = viewportBBox.height * state.scale;
    const x = (containerSvgW - contentW) / 2 - viewportBBox.x * state.scale;
    const y = (containerSvgH - contentH) / 2 - viewportBBox.y * state.scale;
    setPan(x, y);

    emit('center', getPublicState());
  }

  function getPublicState() {
    return {
      scale: state.scale,
      x: state.x,
      y: state.y,
      dragging: state.dragging,
      size: state.size
    };
  }

  return {
    // called by DOM layer when sizes change
    setMeasurements(measurements) {
      state.size = measurements;
      emit('measure', measurements);
      requestRender();
    },

    // public API methods
    zoomIn,
    zoomOut,
    zoomTo(scale, originPx = null) {
      setZoomSmooth(scale, originPx);
    },
    wheelZoomBy,
    panBy,
    panTo,
    reset,
    fit,
    center,
    getState: getPublicState,
    getOptions: () => options
  };
}
