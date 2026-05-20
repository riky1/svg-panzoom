import { clamp } from '../utils/clamp.js';

/**
 * Compute bounded pan values.
 * All coordinates (pan, contentW/H, containerW/H) must be in the same space.
 * Since pan/translate values are in SVG user units, container (CSS px) and padding (CSS px)
 * are converted using svgPxRatio before computing limits.
 *
 * @param {{x:number,y:number}} pan
 * @param {{scale:number}} transform
 * @param {{
 *   container:{width:number,height:number},
 *   viewportBBox:{x:number,y:number,width:number,height:number},
 *   svgPxRatio?:number
 * }} size
 * @param {{enabled:boolean, padding:number, overflow?:number|boolean}} boundsOpt
 */
export function applyBounds(pan, transform, size, boundsOpt) {
  if (!boundsOpt?.enabled) return pan;

  const padding = Number.isFinite(boundsOpt.padding) ? boundsOpt.padding : 0;
  const overflowRaw = boundsOpt.overflow;
  const overflow =
    overflowRaw === true ? Infinity : Number.isFinite(overflowRaw) ? overflowRaw : 0;

  const { container, viewportBBox, svgPxRatio = 1 } = size;

  if (!container.width || !container.height || !viewportBBox.width || !viewportBBox.height) {
    return pan;
  }

  // Convert container (CSS px) and padding (CSS px) to SVG user units so they match state.x/y.
  const containerW = container.width / svgPxRatio;
  const containerH = container.height / svgPxRatio;
  const paddingSvg = padding / svgPxRatio;

  const contentW = viewportBBox.width * transform.scale;
  const contentH = viewportBBox.height * transform.scale;

  // overflow === Infinity means no restriction at all
  if (overflow === Infinity) return pan;

  const minX = Math.min(paddingSvg, containerW - contentW - paddingSvg) - overflow;
  const maxX = Math.max(containerW - contentW - paddingSvg, paddingSvg) + overflow;

  const minY = Math.min(paddingSvg, containerH - contentH - paddingSvg) - overflow;
  const maxY = Math.max(containerH - contentH - paddingSvg, paddingSvg) + overflow;

  return {
    x: clamp(pan.x, minX, maxX),
    y: clamp(pan.y, minY, maxY)
  };
}
