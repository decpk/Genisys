import { getActiveDragDropClaim } from './getActiveDragDropClaim'
import type { DragDropClaimId } from './drag-drop-claim.types'

/** Returns true when the active drag-drop claim is exactly the given id. */
export function isDragDropClaimedBy(id: DragDropClaimId): boolean {
  return getActiveDragDropClaim() === id
}
