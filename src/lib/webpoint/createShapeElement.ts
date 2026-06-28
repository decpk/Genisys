import type { ShapeElement } from '@/store/webpoint-store/types'

/** Create a new rectangle shape centered on the canvas. */
export function createShapeElement(): ShapeElement {
  return {
    id: crypto.randomUUID(),
    type: 'shape',
    shape: 'rectangle',
    x: 35,
    y: 35,
    w: 30,
    h: 30,
    zIndex: 1,
    style: { fill: '#6366f1', borderRadius: 8, opacity: 1 },
    animation: { type: 'none', duration: 500, delay: 0 },
  }
}
