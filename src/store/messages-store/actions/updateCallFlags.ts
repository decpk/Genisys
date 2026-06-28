import type { ActiveCall } from '@/components/Messages/Messages.types'

import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function updateCallFlagsAction(
  get: MessagesGet,
  set: MessagesSet,
  flags: Partial<Pick<ActiveCall, 'micOn' | 'camOn' | 'sharingScreen'>>
): void {
  const { call } = get()
  if (!call) return
  set({ call: { ...call, ...flags } })
}
