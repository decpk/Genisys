import type { MsgIdentity } from '@/components/Messages/Messages.types'

export async function rescan(): Promise<MsgIdentity> {
  return window.api.msgRescan()
}
