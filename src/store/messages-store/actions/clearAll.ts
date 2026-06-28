import { revokeMessageUrls } from '@/components/Messages/utils/revokeMessageUrls'

import { MESSAGES_INITIAL_STATE } from '../messages-store.constants'
import type { MessagesGet, MessagesSet } from '../messages-store.types'

// Tear down all ephemeral state. Image object URLs are revoked first to
// avoid leaking blobs since nothing is persisted across sessions.
export function clearAllAction(get: MessagesGet, set: MessagesSet): void {
  const { messages } = get()
  Object.values(messages).forEach((list) => revokeMessageUrls(list))
  set({ ...MESSAGES_INITIAL_STATE })
}
