/**
 * Pointer/wheel gesture handling for the DOM layer.
 * This module is DOM-aware but does not directly mutate DOM; it calls engine methods.
 *
 * @param {{
 *  containerEl: Element,
 *  options: any,
 *  engine: any,
 *  emitter: { emit: Function },
 *  getOriginFromEvent: (e: WheelEvent|PointerEvent)=>{x:number,y:number}
 * }} ctx
 */
export function createGestures(ctx) {
  const { containerEl, options, engine, emitter, getOriginFromEvent } = ctx;

  /** @type {number | null} */
  let dragPointerId = null;
  let dragLast = { x: 0, y: 0 };
  let dragging = false;

  // Inertia tracking (px/ms)
  let lastMoveTs = 0;
  let velocity = { x: 0, y: 0 };
  /** @type {number | null} */
  let inertiaRaf = null;

  function stopInertia() {
    if (inertiaRaf != null) cancelAnimationFrame(inertiaRaf);
    inertiaRaf = null;
  }

  /** @type {((e: PointerEvent)=>void) | null} */
  let onPointerDown = null;
  /** @type {((e: PointerEvent)=>void) | null} */
  let onPointerMove = null;
  /** @type {((e: PointerEvent)=>void) | null} */
  let onPointerUp = null;
  /** @type {((e: WheelEvent)=>void) | null} */
  let onWheel = null;

  function normalizeWheelDelta(e) {
    // minimal normalization: convert to pixels
    // deltaMode: 0=pixel, 1=line, 2=page
    const LINE_PX = 16;
    const PAGE_PX = 800;

    let dx = e.deltaX;
    let dy = e.deltaY;

    if (e.deltaMode === 1) {
      dx *= LINE_PX;
      dy *= LINE_PX;
    } else if (e.deltaMode === 2) {
      dx *= PAGE_PX;
      dy *= PAGE_PX;
    }

    return { dx, dy };
  }

  function bind() {
    containerEl.style.touchAction = 'none'; // allow custom pan/zoom gestures (MVP)

    onPointerDown = (e) => {
      if (!options.panEnabled) return;
      if (e.button !== 0) return; // left click only (mouse); pointer for touch has button=0
      stopInertia();
      dragging = true;
      dragPointerId = e.pointerId;
      // Track drag position in SVG user units so pan deltas match the engine's coordinate space.
      dragLast = getOriginFromEvent(e);
      lastMoveTs = performance.now();
      velocity = { x: 0, y: 0 };
      containerEl.setPointerCapture?.(e.pointerId);
      emitter.emit('dragstart', { x: e.clientX, y: e.clientY });
    };

    onPointerMove = (e) => {
      if (!dragging) return;
      if (dragPointerId !== e.pointerId) return;

      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTs);

      // Convert current pointer to SVG user units so deltas are consistent with state.x/y.
      const current = getOriginFromEvent(e);
      const dx = current.x - dragLast.x;
      const dy = current.y - dragLast.y;
      dragLast = current;

      // low-pass filter velocity for smoother inertia (SVG user units / ms)
      const vx = dx / dt;
      const vy = dy / dt;
      velocity.x = velocity.x * 0.7 + vx * 0.3;
      velocity.y = velocity.y * 0.7 + vy * 0.3;
      lastMoveTs = now;

      engine.panBy(dx, dy);
      emitter.emit('drag', { dx, dy });
    };

    onPointerUp = (e) => {
      if (dragPointerId !== e.pointerId) return;
      dragging = false;
      dragPointerId = null;
      containerEl.releasePointerCapture?.(e.pointerId);

      // Start inertia (small glide) if enabled
      if (options.inertiaPan) {
        const durationMs = Math.max(0, Number(options.inertiaDuration) || 0);
        const friction = Math.min(0.999, Math.max(0.5, Number(options.inertiaFriction) || 0.92));

        // Convert to px/frame at ~60fps baseline
        let vx = velocity.x * 16.67;
        let vy = velocity.y * 16.67;

        const start = performance.now();
        let last = start;

        const tick = () => {
          const now = performance.now();
          const dt = now - last;
          last = now;

          // scale per-frame velocity proportionally to actual dt
          const frameScale = dt / 16.67;

          engine.panBy(vx * frameScale, vy * frameScale);
          vx *= friction;
          vy *= friction;

          const elapsed = now - start;
          const speed = Math.hypot(vx, vy);

          if (elapsed < durationMs && speed > 0.01) inertiaRaf = requestAnimationFrame(tick);
          else inertiaRaf = null;
        };

        inertiaRaf = requestAnimationFrame(tick);
      }

      emitter.emit('dragend', {});
    };

    onWheel = (e) => {
      if (!options.wheelZoom) return;
      // Only zoom if cursor is over the container
      e.preventDefault();

      const { dy } = normalizeWheelDelta(e);
      // dy > 0 => zoom out, dy < 0 => zoom in
      const origin = getOriginFromEvent(e);

      // Prefer continuous wheel zoom if available (more fluid)
      if (typeof engine.wheelZoomBy === 'function') engine.wheelZoomBy(dy, origin);
      else if (dy < 0) engine.zoomIn(origin);
      else if (dy > 0) engine.zoomOut(origin);

      emitter.emit('wheel', { dy });
    };

    containerEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    containerEl.addEventListener('wheel', onWheel, { passive: false });
  }

  function unbind() {
    stopInertia();
    if (onPointerDown) containerEl.removeEventListener('pointerdown', onPointerDown);
    if (onWheel) containerEl.removeEventListener('wheel', onWheel);

    if (onPointerMove) window.removeEventListener('pointermove', onPointerMove);
    if (onPointerUp) window.removeEventListener('pointerup', onPointerUp);

    onPointerDown = null;
    onPointerMove = null;
    onPointerUp = null;
    onWheel = null;
  }

  return { bind, unbind };
}
