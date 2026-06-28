import type { CallKind } from '@/components/Messages/Messages.types'

/**
 * Why local media capture failed, normalized across `getUserMedia` DOMException
 * names and the native (macOS) permission pre-flight.
 */
export type MediaAccessReason =
  | 'denied' // permission blocked (NotAllowedError / SecurityError / native TCC denial)
  | 'notFound' // no matching device (NotFoundError / OverconstrainedError)
  | 'inUse' // device busy or hardware error (NotReadableError / AbortError)
  | 'unsupported' // mediaDevices/getUserMedia unavailable in this environment
  | 'unknown'

/**
 * Error thrown by {@link getLocalMedia} when the microphone/camera can't be
 * acquired. Carries a typed {@link MediaAccessReason} and the call kind so the
 * call controllers can show a specific message and route the user to the
 * correct macOS privacy pane.
 */
export class MediaAccessError extends Error {
  readonly reason: MediaAccessReason
  readonly kind: CallKind

  constructor(message: string, reason: MediaAccessReason, kind: CallKind) {
    super(message)
    this.name = 'MediaAccessError'
    this.reason = reason
    this.kind = kind
  }

  /** The System Settings privacy pane most relevant to this failure. */
  get privacyPane(): 'camera' | 'microphone' {
    return this.kind === 'video' ? 'camera' : 'microphone'
  }
}
