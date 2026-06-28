import type { MsgIdentity } from '@/components/Messages/Messages.types'

export async function rotateIdentity(): Promise<MsgIdentity> {
  return window.api.msgRotateIdentity()
}
