import { uid } from '../utils/uid.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Resolve container/svg/viewport elements.
 * - options.element can be an <svg> or a container that contains an <svg>
 * - viewportSelector, if provided, is searched inside the svg
 * - if viewportSelector not provided, tries to find a sensible <g data-spz-viewport> or first <g>
 * - if nothing found, creates a <g> and moves all svg children into it (except <defs>)
 *
 * @param {{ element: Element, viewportSelector: string | null }} options
 */
export function mount(options) {
  const element = options.element;

  /** @type {Element} */
  let containerEl = element;
  /** @type {SVGSVGElement | null} */
  let svgEl = null;

  if (element instanceof SVGSVGElement) {
    svgEl = element;
  } else {
    svgEl = element.querySelector('svg');
  }

  if (!svgEl) {
    throw new Error('[svg-panzoom] Could not find <svg> inside options.element.');
  }

  if (element instanceof SVGSVGElement) {
    // container is the svg itself
    containerEl = svgEl;
  }

  /** @type {SVGGraphicsElement} */
  let viewportEl = null;

  if (options.viewportSelector) {
    viewportEl = svgEl.querySelector(options.viewportSelector);
    if (!viewportEl) {
      throw new Error(`[svg-panzoom] viewportSelector not found: ${options.viewportSelector}`);
    }
  } else {
    viewportEl =
      svgEl.querySelector('[data-spz-viewport]') ||
      svgEl.querySelector('g') ||
      null;
  }

  let createdViewport = false;

  if (!viewportEl) {
    // create a viewport group and move nodes into it (except defs)
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('data-spz-viewport', 'true');

    // move children
    const children = Array.from(svgEl.childNodes);
    for (const n of children) {
      if (n.nodeType === Node.ELEMENT_NODE && n.nodeName.toLowerCase() === 'defs') continue;
      g.appendChild(n);
    }
    svgEl.appendChild(g);
    viewportEl = g;
    createdViewport = true;
  }

  // basic classes (BEM)
  const rootId = uid('spz');
  containerEl.classList.add('spz');
  svgEl.classList.add('spz__svg');
  viewportEl.classList.add('spz__viewport');
  containerEl.setAttribute('data-spz-id', rootId);

  return {
    rootId,
    containerEl,
    svgEl,
    viewportEl,
    createdViewport,
    destroy() {
      // remove classes/attrs we added
      containerEl.classList.remove('spz');
      svgEl.classList.remove('spz__svg');
      viewportEl.classList.remove('spz__viewport');
      containerEl.removeAttribute('data-spz-id');

      // If we created a viewport, we keep it in DOM (non-destructive MVP).
      // v2 improvement: restore original DOM structure.
    }
  };
}
