import type {
  ActiveCall,
  IncomingCallInfo,
} from '@/components/Messages/Messages.types'

import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function setIncomingCallAction(
  _get: MessagesGet,
  set: MessagesSet,
  info: IncomingCallInfo | null
): void {
  if (!info) {
    set({ incomingCall: null })
    return
  }
  const call: ActiveCall = {
    peerId: info.peerId,
    kind: info.kind,
    status: 'incoming',
    direction: 'incoming',
    micOn: true,
    camOn: info.kind === 'video',
    sharingScreen: false,
    startedAt: null,
  }
  set({ incomingCall: info, call })
}
