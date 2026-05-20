/**
 * requestAnimationFrame helper that allows canceling a pending frame.
 */
export function createRafScheduler() {
  /** @type {number | null} */
  let rafId = null;

  return {
    /**
     * Schedule a callback on the next animation frame. If already scheduled, it replaces it.
     * @param {() => void} cb
     */
    schedule(cb) {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        cb();
      });
    },
    cancel() {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}
