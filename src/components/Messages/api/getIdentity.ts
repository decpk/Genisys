import type { MsgIdentity } from '@/components/Messages/Messages.types'

// Re-read the local identity snapshot. The backend re-probes the LAN IP on
// every call, so this is used to pick up the network address once the OS
// networking stack is ready after a cold start.
export async function getIdentity(): Promise<MsgIdentity> {
  return window.api.msgGetIdentity()
}
