import type { ControlMessage } from '@/components/Messages/Messages.types'

/** Serialises an app-control message for relay over the encrypted channel. */
export function encodeControl(message: ControlMessage): string {
  return JSON.stringify(message)
}
