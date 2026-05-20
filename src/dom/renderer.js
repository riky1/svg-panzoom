import { createRafScheduler } from '../utils/raf.js';

/**
 * Apply transform to the viewport element (preferably a <g>).
 * Uses rAF to coalesce multiple changes.
 *
 * @param {{
 *  viewportEl: SVGGraphicsElement,
 *  engine: any
 * }} ctx
 */
export function createRenderer(ctx) {
  const { viewportEl, engine } = ctx;
  const raf = createRafScheduler();

  let last = { x: null, y: null, scale: null };

  function applyTransform(state) {
    const { x, y, scale } = state;

    if (x === last.x && y === last.y && scale === last.scale) return;

    // Transform is: translate(x y) scale(scale)
    // This means: apply scale first, then translate.
    // Result in matrix terms: final = T * S
    //   screen_point = S * content_point + T
    //   i.e. screen = pan + content * scale   (pan in screen px, not scaled)
    viewportEl.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);

    last = { x, y, scale };
  }

  function requestRender() {
    raf.schedule(() => {
      const s = engine.getState();
      applyTransform(s);
    });
  }

  function destroy() {
    raf.cancel();
  }

  return { requestRender, destroy };
}
