import type { MessagesSet } from '../messages-store.types'

export function setRightPanelOpenAction(set: MessagesSet, open: boolean): void {
  set({ rightPanelOpen: open })
}
