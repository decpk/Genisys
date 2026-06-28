import { dragDropClaimStack } from './drag-drop-claim.state'
import type { DragDropClaimId, DragDropClaimRelease } from './drag-drop-claim.types'

/**
 * Push a drag-drop claim onto the stack. Returns a release function that pops
 * the most recent matching id. Safe to call repeatedly; idempotent on the
 * release side (calling release twice is a no-op).
 */
export function pushDragDropClaim(id: DragDropClaimId): DragDropClaimRelease {
  dragDropClaimStack.push(id)
  let released = false
  return () => {
    if (released) return
    released = true
    const idx = dragDropClaimStack.lastIndexOf(id)
    if (idx !== -1) dragDropClaimStack.splice(idx, 1)
  }
}
