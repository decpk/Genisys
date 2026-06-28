import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function endCallAction(_get: MessagesGet, set: MessagesSet): void {
  set({ call: null, incomingCall: null })
}
