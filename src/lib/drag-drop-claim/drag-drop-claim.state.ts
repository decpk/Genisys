import type { DragDropClaimId } from './drag-drop-claim.types'

/**
 * Module-private LIFO stack of active drag-drop claims. The top of the stack
 * is the current "owner" of native OS drops. Newer claims (e.g. modals
 * opening on top) override older ones, and releasing pops the most recent
 * matching id so out-of-order release calls behave sanely.
 *
 * Not exported as a function — consumers must go through `pushDragDropClaim`,
 * `getActiveDragDropClaim`, `hasDragDropClaim`, and `isDragDropClaimedBy`.
 */
export const dragDropClaimStack: DragDropClaimId[] = []
