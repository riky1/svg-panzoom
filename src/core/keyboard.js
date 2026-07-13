/**
 * Keyboard navigation handler — smooth animated pan with inertia.
 *
 * When enabled (`options.keyboardNav = true`):
 * - Sets `tabindex="0"` on the container so it can receive focus.
 * - Arrow keys pan the view with smooth acceleration + inertial damping.
 *   Velocity is frame-rate independent (units per ms).
 *   · Acceleration time constant: ~120 ms (feel = smooth ramp-up)
 *   · Deceleration time constant: ~40 ms (feel = quick, controlled coast)
 * - `+` / `=` zoom in; `-` zooms out (smooth animation via engine).
 * - While the container has keyboard focus a small crosshair indicator is shown
 *   at the centre of the container.
 *
 * @param {{
 *  containerEl: Element,
 *  options: any,
 *  engine: any,
 *  emitter: { emit: Function }
 * }} ctx
 */
export function createKeyboard(ctx) {
  const { containerEl, options, engine, emitter } = ctx;

  /** @type {HTMLElement | null} */
  let indicatorEl = null;

  // ── Animation loop state ─────────────────────────────────────────────────
  // Velocity in SVG user-units per millisecond (frame-rate independent)
  let vx = 0;
  let vy = 0;
  /** @type {number | null} */
  let rafId = null;
  let lastTs = 0;

  /** Currently held direction keys */
  const pressed = new Set();

  /**
   * Max velocity in SVG user-units per ms.
   * keyStep is in screen-px at scale=1; divide by scale and by 16.67 ms/frame to get units/ms.
   */
  function maxVelocity() {
    const keyStep = Number.isFinite(options.keyStep) ? options.keyStep : 10;
    return keyStep / engine.getState().scale / 16.67;
  }

  function tick(ts) {
    const dt = lastTs ? Math.min(ts - lastTs, 64) : 16; // cap at 64 ms (tab was hidden)
    lastTs = ts;

    // ── Compute target velocity direction from held keys ──────────────────
    let tx = 0;
    let ty = 0;
    if (pressed.has('ArrowLeft')) tx += 1;
    if (pressed.has('ArrowRight')) tx -= 1;
    if (pressed.has('ArrowUp')) ty += 1;
    if (pressed.has('ArrowDown')) ty -= 1;

    // Normalise diagonal so speed is consistent in all directions
    const len = Math.hypot(tx, ty);
    const vMax = maxVelocity();
    const targetVx = len > 0 ? (tx / len) * vMax : 0;
    const targetVy = len > 0 ? (ty / len) * vMax : 0;

    if (pressed.size > 0) {
      // ── Acceleration: exponential approach to target velocity ─────────
      // Time constant τ = 120 ms → smooth ramp, reaches ≈63 % in 120 ms
      const alpha = 1 - Math.exp(-dt / 120);
      vx += (targetVx - vx) * alpha;
      vy += (targetVy - vy) * alpha;
    } else {
      // ── Inertia: exponential decay after key release ───────────────────
      // Time constant τ = 40 ms → velocity halves in ≈28 ms, stops in ~150 ms
      const decay = Math.exp(-dt / 40);
      vx *= decay;
      vy *= decay;
    }

    // ── Apply pan ─────────────────────────────────────────────────────────
    const dx = vx * dt;
    const dy = vy * dt;
    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
      engine.panBy(dx, dy);
    }

    // ── Continue or stop ──────────────────────────────────────────────────
    const moving = Math.abs(vx) > 0.0001 || Math.abs(vy) > 0.0001;
    if (pressed.size > 0 || moving) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      vx = 0;
      vy = 0;
      lastTs = 0;
    }
  }

  function startLoop() {
    if (rafId == null) {
      lastTs = 0;
      rafId = requestAnimationFrame(tick);
    }
  }

  function stopLoop() {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    vx = 0;
    vy = 0;
    lastTs = 0;
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  /** @type {((e: KeyboardEvent) => void) | null} */
  let onKeyDown = null;
  /** @type {((e: KeyboardEvent) => void) | null} */
  let onKeyUp = null;

  const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

  function bind() {
    if (!options.keyboardNav) return;

    // Make container focusable (don't override if the consumer already set tabindex)
    if (!containerEl.hasAttribute('tabindex')) {
      containerEl.setAttribute('tabindex', '0');
    }

    // Create the centre focus-indicator element
    indicatorEl = document.createElement('div');
    indicatorEl.className = 'spz__keyboard-indicator';
    indicatorEl.setAttribute('aria-hidden', 'true');
    containerEl.appendChild(indicatorEl);

    onKeyDown = (e) => {
      if (ARROW_KEYS.has(e.key)) {
        e.preventDefault();
        if (!pressed.has(e.key)) {
          pressed.add(e.key);
          startLoop();
          emitter.emit('keyboardNav', { key: e.key, type: 'pan' });
        }
        return;
      }

      // Discrete zoom keys
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          engine.zoomIn();
          emitter.emit('keyboardNav', { key: e.key, type: 'zoom' });
          break;
        case '-':
          e.preventDefault();
          engine.zoomOut();
          emitter.emit('keyboardNav', { key: e.key, type: 'zoom' });
          break;
      }
    };

    onKeyUp = (e) => {
      if (ARROW_KEYS.has(e.key)) {
        pressed.delete(e.key);
        // Loop continues for inertia; it will self-stop when velocity fades
      }
    };

    // On blur: clear held keys so movement doesn't get stuck.
    // Inertia continues naturally after blur; the loop self-stops.
    const onBlur = () => pressed.clear();

    containerEl.addEventListener('keydown', onKeyDown);
    containerEl.addEventListener('keyup', onKeyUp);
    containerEl.addEventListener('blur', onBlur);

    // Store onBlur so unbind() can remove it
    onKeyDown._blur = onBlur;
  }

  function unbind() {
    stopLoop();
    pressed.clear();

    if (indicatorEl && indicatorEl.parentNode) {
      indicatorEl.parentNode.removeChild(indicatorEl);
    }
    indicatorEl = null;

    if (onKeyDown) {
      containerEl.removeEventListener('keydown', onKeyDown);
      if (onKeyDown._blur) containerEl.removeEventListener('blur', onKeyDown._blur);
    }
    if (onKeyUp) containerEl.removeEventListener('keyup', onKeyUp);

    onKeyDown = null;
    onKeyUp = null;
  }

  return { bind, unbind };
}
