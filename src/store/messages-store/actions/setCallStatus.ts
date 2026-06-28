import type { CallStatus } from '@/components/Messages/Messages.types'

import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function setCallStatusAction(
  get: MessagesGet,
  set: MessagesSet,
  status: CallStatus
): void {
  const { call } = get()
  if (!call) return
  set({ call: { ...call, status } })
}
