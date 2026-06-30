import { createSvgPanZoom } from '../../src/index.js';
import '../../src/styles/svg-panzoom.scss';

const demo = document.querySelector('#demo');

const instance = createSvgPanZoom({
  element: demo,
  viewportSelector: '[data-spz-viewport]',
  // minZoom e zoomStep vengono ereditati da DEFAULT_OPTIONS in state.js
  maxZoom: 6,
  wheelZoom: true,
  panEnabled: true,
  bounds: { enabled: true, padding: 20, overflow: true },
  fitOnInit: false,
  centerOnInit: true
});

// wire buttons
document.querySelector('#zoomIn').addEventListener('click', () => instance.zoomIn());
document.querySelector('#zoomOut').addEventListener('click', () => instance.zoomOut());
document.querySelector('#reset').addEventListener('click', () => instance.reset());
document.querySelector('#fit').addEventListener('click', () => instance.fit());
document.querySelector('#center').addEventListener('click', () => instance.center());

// optional logging
instance.on('zoom', (e) => console.log('zoom', e));
instance.on('change', (s) => console.log('state', s));
