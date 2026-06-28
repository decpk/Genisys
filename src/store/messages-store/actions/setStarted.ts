import type { MessagesSet } from '../messages-store.types'

export function setStartedAction(set: MessagesSet, isStarted: boolean): void {
  set({ isStarted })
}
