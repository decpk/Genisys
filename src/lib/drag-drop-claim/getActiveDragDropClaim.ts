import { dragDropClaimStack } from './drag-drop-claim.state'
import type { DragDropClaimId } from './drag-drop-claim.types'

/**
 * Returns the id of the current drag-drop claim owner (top of the stack), or
 * null when no claim is active.
 */
export function getActiveDragDropClaim(): DragDropClaimId | null {
  if (dragDropClaimStack.length === 0) return null
  return dragDropClaimStack[dragDropClaimStack.length - 1]
}
