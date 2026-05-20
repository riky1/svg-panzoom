/**
 * Minimal event emitter (on/off/emit).
 */
export function createEmitter() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  return {
    /**
     * @param {string} event
     * @param {(payload?: any) => void} cb
     */
    on(event, cb) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(cb);
      return () => this.off(event, cb);
    },

    /**
     * @param {string} event
     * @param {(payload?: any) => void} cb
     */
    off(event, cb) {
      const set = listeners.get(event);
      if (!set) return;
      set.delete(cb);
      if (set.size === 0) listeners.delete(event);
    },

    /**
     * @param {string} event
     * @param {any} [payload]
     */
    emit(event, payload) {
      const set = listeners.get(event);
      if (!set) return;
      // copy to avoid mutation during emit
      [...set].forEach((cb) => cb(payload));
    },

    clear() {
      listeners.clear();
    }
  };
}
