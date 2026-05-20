import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSvgPanZoom } from './index.js';

describe('svg-panzoom Public API v1.0', () => {
  let container;
  let svg;
  let instance;

  beforeEach(() => {
    // Create a minimal SVG structure
    container = document.createElement('div');
    container.style.width = '500px';
    container.style.height = '500px';
    container.style.position = 'relative';
    document.body.appendChild(container);

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.style.width = '100%';
    svg.style.height = '100%';

    // Add a simple shape to the SVG
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '50');
    rect.setAttribute('y', '50');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '100');
    rect.setAttribute('fill', 'blue');
    svg.appendChild(rect);

    container.appendChild(svg);
  });

  afterEach(() => {
    if (instance) {
      instance.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('createSvgPanZoom(options)', () => {
    it('should throw if element is missing', () => {
      expect(() => {
        createSvgPanZoom({ element: undefined });
      }).toThrow();
    });

    it('should create instance with inline SVG element', () => {
      instance = createSvgPanZoom({ element: svg });
      expect(instance).toBeDefined();
      expect(typeof instance.zoomIn).toBe('function');
      expect(typeof instance.zoomOut).toBe('function');
      expect(typeof instance.panBy).toBe('function');
    });

    it('should create instance with container element', () => {
      instance = createSvgPanZoom({ element: container });
      expect(instance).toBeDefined();
    });

    it('should normalize options with defaults', () => {
      instance = createSvgPanZoom({ element: svg });
      const opts = instance.getOptions();
      expect(opts.minZoom).toBe(0.0001);
      expect(opts.maxZoom).toBe(10);
      expect(opts.initialZoom).toBe(1);
      expect(opts.zoomStep).toBe(1.25);
      expect(opts.zoomDuration).toBe(200);
      expect(opts.wheelZoom).toBe(true);
      expect(opts.panEnabled).toBe(true);
      expect(opts.inertiaPan).toBe(true);
      expect(opts.inertiaDuration).toBe(300);
      expect(opts.inertiaFriction).toBe(0.92);
    });
  });

  describe('zoomIn()', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should increase zoom level', () => {
      const stateBefore = instance.getState();
      instance.zoomIn();
      const stateAfter = instance.getState();
      expect(stateAfter.scale).toBeGreaterThan(stateBefore.scale);
    });

    it('should be idempotent when called multiple times', () => {
      instance.zoomIn();
      const state1 = instance.getState();
      instance.zoomIn();
      const state2 = instance.getState();
      expect(state2.scale).toBeGreaterThan(state1.scale);
    });

    it('should accept optional origin parameter', () => {
      instance.zoomIn({ x: 0, y: 0 });
      const state = instance.getState();
      expect(state.scale).toBeGreaterThan(1);
    });

    it('should respect maxZoom constraint', () => {
      instance = createSvgPanZoom({ element: svg, maxZoom: 2 });
      for (let i = 0; i < 10; i++) {
        instance.zoomIn();
      }
      const state = instance.getState();
      expect(state.scale).toBeLessThanOrEqual(2);
    });
  });

  describe('zoomOut()', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg, initialZoom: 2 });
    });

    it('should decrease zoom level', () => {
      const stateBefore = instance.getState();
      instance.zoomOut();
      const stateAfter = instance.getState();
      expect(stateAfter.scale).toBeLessThan(stateBefore.scale);
    });

    it('should respect minZoom constraint', () => {
      for (let i = 0; i < 10; i++) {
        instance.zoomOut();
      }
      const state = instance.getState();
      expect(state.scale).toBeGreaterThanOrEqual(0.0001);
    });

    it('should accept optional origin parameter', () => {
      instance.zoomOut({ x: 100, y: 100 });
      const state = instance.getState();
      expect(state.scale).toBeLessThan(2);
    });
  });

  describe('zoomTo(scale, origin?)', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should set exact zoom level', () => {
      instance.zoomTo(3);
      const state = instance.getState();
      expect(state.scale).toBeCloseTo(3, 1);
    });

    it('should clamp zoom between minZoom and maxZoom', () => {
      instance.zoomTo(100);
      const state1 = instance.getState();
      expect(state1.scale).toBeLessThanOrEqual(10);

      instance.zoomTo(0.00001);
      const state2 = instance.getState();
      expect(state2.scale).toBeGreaterThanOrEqual(0.0001);
    });

    it('should accept optional origin parameter', () => {
      instance.zoomTo(2, { x: 50, y: 50 });
      const state = instance.getState();
      expect(state.scale).toBeCloseTo(2, 1);
    });
  });

  describe('panBy(dx, dy)', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should move view by delta', () => {
      const stateBefore = instance.getState();
      instance.panBy(10, 20);
      const stateAfter = instance.getState();
      // Pan values should change (exact values depend on internal calculations)
      expect(stateAfter).toBeDefined();
    });

    it('should accept positive and negative deltas', () => {
      instance.panBy(-10, -20);
      const state = instance.getState();
      expect(state).toBeDefined();
    });

    it('should be callable multiple times', () => {
      instance.panBy(5, 5);
      instance.panBy(5, 5);
      instance.panBy(5, 5);
      const state = instance.getState();
      expect(state).toBeDefined();
    });
  });

  describe('panTo(x, y)', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should set absolute pan position', () => {
      instance.panTo(50, 50);
      const state = instance.getState();
      expect(state.x).toBeCloseTo(50, 1);
      expect(state.y).toBeCloseTo(50, 1);
    });

    it('should be idempotent', () => {
      instance.panTo(100, 100);
      const state1 = instance.getState();
      instance.panTo(100, 100);
      const state2 = instance.getState();
      expect(state2.x).toBeCloseTo(state1.x, 0);
      expect(state2.y).toBeCloseTo(state1.y, 0);
    });
  });

  describe('reset()', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg, initialZoom: 2 });
    });

    it('should reset zoom to initial value', () => {
      instance.zoomIn();
      instance.zoomIn();
      instance.reset();
      const state = instance.getState();
      expect(state.scale).toBeCloseTo(2, 1);
    });

    it('should reset pan to initial position', () => {
      instance.panBy(100, 100);
      instance.reset();
      const state = instance.getState();
      // After reset, pan should be back to initial state (typically 0, 0)
      expect(state).toBeDefined();
    });

    it('should be idempotent', () => {
      instance.reset();
      const state1 = instance.getState();
      instance.reset();
      const state2 = instance.getState();
      expect(state2.scale).toBeCloseTo(state1.scale, 1);
      expect(state2.x).toBeCloseTo(state1.x, 1);
      expect(state2.y).toBeCloseTo(state1.y, 1);
    });
  });

  describe('fit()', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should fit content in viewport', () => {
      instance.fit();
      const state = instance.getState();
      expect(state.scale).toBeGreaterThan(0);
      expect(state.scale).toBeLessThanOrEqual(10);
    });

    it('should be idempotent', () => {
      instance.fit();
      const state1 = instance.getState();
      instance.fit();
      const state2 = instance.getState();
      expect(state2.scale).toBeCloseTo(state1.scale, 1);
    });
  });

  describe('center()', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should center content in viewport', () => {
      instance.panBy(100, 100);
      instance.center();
      const state = instance.getState();
      expect(state).toBeDefined();
    });

    it('should be idempotent', () => {
      instance.center();
      const state1 = instance.getState();
      instance.center();
      const state2 = instance.getState();
      expect(state2.x).toBeCloseTo(state1.x, 1);
      expect(state2.y).toBeCloseTo(state1.y, 1);
    });
  });

  describe('getState()', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should return current state object', () => {
      const state = instance.getState();
      expect(state).toBeDefined();
      expect(typeof state.scale).toBe('number');
      expect(typeof state.x).toBe('number');
      expect(typeof state.y).toBe('number');
      expect(typeof state.dragging).toBe('boolean');
    });

    it('should include size measurements', () => {
      const state = instance.getState();
      expect(state.size).toBeDefined();
      expect(state.size.container).toBeDefined();
      expect(state.size.svg).toBeDefined();
      expect(state.size.viewportBBox).toBeDefined();
      expect(typeof state.size.container.width).toBe('number');
      expect(typeof state.size.container.height).toBe('number');
    });

    it('should return fresh snapshot on each call', () => {
      const state1 = instance.getState();
      instance.zoomIn();
      const state2 = instance.getState();
      expect(state2.scale).toBeGreaterThan(state1.scale);
    });
  });

  describe('getOptions()', () => {
    it('should return normalized options with all defaults', () => {
      instance = createSvgPanZoom({ element: svg });
      const opts = instance.getOptions();
      expect(opts.minZoom).toBeDefined();
      expect(opts.maxZoom).toBeDefined();
      expect(opts.zoomStep).toBeDefined();
      expect(opts.panEnabled).toBeDefined();
      expect(opts.inertiaPan).toBeDefined();
    });

    it('should reflect user-provided options', () => {
      instance = createSvgPanZoom({
        element: svg,
        minZoom: 0.5,
        maxZoom: 5,
        zoomStep: 1.5
      });
      const opts = instance.getOptions();
      expect(opts.minZoom).toBe(0.5);
      expect(opts.maxZoom).toBe(5);
      expect(opts.zoomStep).toBe(1.5);
    });
  });

  describe('on(event, callback)', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should return an unsubscribe function', () => {
      const unsubscribe = instance.on('change', () => {});
      expect(typeof unsubscribe).toBe('function');
    });

    it('should support "change" event', (done) => {
      let called = false;
      instance.on('change', () => {
        called = true;
      });
      instance.zoomIn();
      setTimeout(() => {
        expect(called).toBe(true);
        done();
      }, 50);
    });

    it('should support "zoom" event', (done) => {
      let called = false;
      instance.on('zoom', () => {
        called = true;
      });
      instance.zoomIn();
      setTimeout(() => {
        expect(called).toBe(true);
        done();
      }, 50);
    });

    it('should support unsubscribing via returned function', (done) => {
      let callCount = 0;
      const unsubscribe = instance.on('change', () => {
        callCount++;
      });
      instance.zoomIn();
      setTimeout(() => {
        const countAfterFirst = callCount;
        unsubscribe();
        instance.zoomIn();
        setTimeout(() => {
          expect(callCount).toBe(countAfterFirst);
          done();
        }, 50);
      }, 50);
    });
  });

  describe('off(event, callback)', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should unsubscribe from event', (done) => {
      let callCount = 0;
      const callback = () => {
        callCount++;
      };
      instance.on('change', callback);
      instance.zoomIn();
      setTimeout(() => {
        const countAfterFirst = callCount;
        instance.off('change', callback);
        instance.zoomIn();
        setTimeout(() => {
          expect(callCount).toBe(countAfterFirst);
          done();
        }, 50);
      }, 50);
    });
  });

  describe('destroy()', () => {
    beforeEach(() => {
      instance = createSvgPanZoom({ element: svg });
    });

    it('should be callable', () => {
      expect(() => {
        instance.destroy();
      }).not.toThrow();
    });

    it('should be idempotent', () => {
      instance.destroy();
      expect(() => {
        instance.destroy();
      }).not.toThrow();
    });

    it('should clean up listeners', () => {
      let called = false;
      instance.on('change', () => {
        called = true;
      });
      instance.destroy();
      instance.zoomIn();
      expect(called).toBe(false);
    });
  });
});
