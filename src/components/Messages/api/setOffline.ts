import type { MsgIdentity } from '@/components/Messages/Messages.types'

export async function setOffline(offline: boolean): Promise<MsgIdentity> {
  return window.api.msgSetOffline(offline)
}
