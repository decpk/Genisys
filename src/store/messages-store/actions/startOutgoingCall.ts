import type {
  ActiveCall,
  CallKind,
} from '@/components/Messages/Messages.types'

import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function startOutgoingCallAction(
  _get: MessagesGet,
  set: MessagesSet,
  peerId: string,
  kind: CallKind
): void {
  const call: ActiveCall = {
    peerId,
    kind,
    status: 'outgoing',
    direction: 'outgoing',
    micOn: true,
    camOn: kind === 'video',
    sharingScreen: false,
    startedAt: null,
  }
  set({ call })
}
