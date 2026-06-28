/**
 * Returns true when the given client-space point falls outside the rect.
 * A null rect (e.g. element unmounted) is treated as "outside" so callers
 * default to the detach behavior rather than silently swallowing the gesture.
 */
export function isPointOutsideRect(
  point: { x: number; y: number },
  rect: DOMRect | null,
): boolean {
  if (!rect) return true
  return (
    point.x < rect.left ||
    point.x > rect.right ||
    point.y < rect.top ||
    point.y > rect.bottom
  )
}
