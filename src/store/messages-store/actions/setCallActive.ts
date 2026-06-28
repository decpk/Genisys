import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function setCallActiveAction(
  get: MessagesGet,
  set: MessagesSet
): void {
  const { call } = get()
  if (!call) return
  set({ call: { ...call, status: 'active', startedAt: Date.now() } })
}
