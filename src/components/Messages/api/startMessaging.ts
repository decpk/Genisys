import type { MsgIdentity } from '@/components/Messages/Messages.types'

// Boot the local identity, listener and LAN discovery. Returns the identity.
export async function startMessaging(): Promise<MsgIdentity> {
  return window.api.msgStart()
}
