/**
 * Observe size changes and notify via callback.
 * MVP: uses ResizeObserver when available, falls back to window resize.
 *
 * @param {{
 *  element: Element,
 *  onResize: ()=>void
 * }} ctx
 */
export function createObserver(ctx) {
  const { element, onResize } = ctx;

  /** @type {ResizeObserver | null} */
  let ro = null;
  /** @type {((e: UIEvent)=>void) | null} */
  let onWindowResize = null;

  function bind() {
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => onResize());
      ro.observe(element);
    } else {
      onWindowResize = () => onResize();
      window.addEventListener('resize', onWindowResize);
    }
  }

  function unbind() {
    if (ro) {
      ro.disconnect();
      ro = null;
    }
    if (onWindowResize) {
      window.removeEventListener('resize', onWindowResize);
      onWindowResize = null;
    }
  }

  return { bind, unbind };
}
