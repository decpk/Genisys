export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se'

interface Geometry {
  x: number
  y: number
  w: number
  h: number
}

/** Minimum element size, in canvas percent. */
const MIN_SIZE = 4

/**
 * Compute new element geometry (all values in canvas percent) for a corner
 * resize, given the dragged handle, the geometry at drag start, and the pointer
 * delta expressed as a percentage of the canvas. Enforces a minimum size
 * without letting the element invert.
 */
export function resizeElementGeometry(
  handle: ResizeHandle,
  start: Geometry,
  deltaXPercent: number,
  deltaYPercent: number
): Geometry {
  let { x, y, w, h } = start

  if (handle === 'se') {
    w = start.w + deltaXPercent
    h = start.h + deltaYPercent
  } else if (handle === 'sw') {
    x = start.x + deltaXPercent
    w = start.w - deltaXPercent
    h = start.h + deltaYPercent
  } else if (handle === 'ne') {
    y = start.y + deltaYPercent
    w = start.w + deltaXPercent
    h = start.h - deltaYPercent
  } else {
    x = start.x + deltaXPercent
    y = start.y + deltaYPercent
    w = start.w - deltaXPercent
    h = start.h - deltaYPercent
  }

  if (w < MIN_SIZE) {
    if (handle === 'sw' || handle === 'nw') x = start.x + start.w - MIN_SIZE
    w = MIN_SIZE
  }
  if (h < MIN_SIZE) {
    if (handle === 'ne' || handle === 'nw') y = start.y + start.h - MIN_SIZE
    h = MIN_SIZE
  }

  return { x, y, w, h }
}
