import type { CallSignal } from '@/components/Messages/Messages.types'

/** Serializes a CallSignal into the opaque JSON string sent over the wire. */
export function encodeSignal(signal: CallSignal): string {
  return JSON.stringify(signal)
}
