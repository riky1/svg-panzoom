import { createSvgPanZoom } from '../../src/index.js';
import '../../src/styles/svg-panzoom.scss';

const demo = document.querySelector('#demo');

const instance = createSvgPanZoom({
  element: demo,
  viewportSelector: '[data-spz-viewport]',
  maxZoom: 6,
  wheelZoom: true,
  panEnabled: true,
  bounds: { enabled: true, padding: 20, overflow: true },
  initialZoom: 0.5,
  fitOnInit: false,
  centerOnInit: true,
  keyboardNav: true,  // enable arrow-key pan + +/- zoom
  keyStep: 10,        // screen-px per arrow key press (scaled to current zoom)
});

// Wire toolbar buttons
document.querySelector('#zoomIn').addEventListener('click', () => instance.zoomIn());
document.querySelector('#zoomOut').addEventListener('click', () => instance.zoomOut());
document.querySelector('#reset').addEventListener('click', () => instance.reset());
document.querySelector('#fit').addEventListener('click', () => instance.fit());
document.querySelector('#center').addEventListener('click', () => instance.center());

// Optional event logging
instance.on('zoom', (e) => console.log('zoom', e));
instance.on('change', (s) => console.log('state', s));
instance.on('keyboardNav', (e) => console.log('keyboardNav', e));
