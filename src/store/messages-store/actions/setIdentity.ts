import type { MsgIdentity } from '@/components/Messages/Messages.types'

import type { MessagesSet } from '../messages-store.types'

export function setIdentityAction(set: MessagesSet, identity: MsgIdentity): void {
  set({ identity })
}
