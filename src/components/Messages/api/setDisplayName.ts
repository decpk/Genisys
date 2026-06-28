import type { MsgIdentity } from '@/components/Messages/Messages.types'

export async function setDisplayName(name: string): Promise<MsgIdentity> {
  return window.api.msgSetDisplayName(name)
}
