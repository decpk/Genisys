import { dragDropClaimStack } from './drag-drop-claim.state'

/**
 * Returns true if any consumer has claimed exclusive ownership of the next
 * native OS drag-drop event. Background listeners (e.g. Chat source attachments)
 * should skip their handler when this is true so a single drop doesn't get attached
 * to multiple destinations.
 */
export function hasDragDropClaim(): boolean {
  return dragDropClaimStack.length > 0
}
