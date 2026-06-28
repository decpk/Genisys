import type { CallKind } from '@/components/Messages/Messages.types'

import { MediaAccessError, type MediaAccessReason } from './mediaAccessError'

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
}

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30 },
}

/**
 * Best-effort native (macOS) permission pre-flight.
 *
 * WKWebView already grants the web-layer `getUserMedia` permission, but on a
 * packaged `.app` the OS only registers Genisys under System Settings → Privacy →
 * Microphone/Camera once an AVFoundation request reaches TCC. Driving that
 * request from the Genisys process here makes the prompt fire deterministically.
 *
 * If the native command is unavailable (older binary, non-macOS, or running
 * outside Tauri) this resolves quietly and we fall back to plain `getUserMedia`
 * — preserving the previous behavior.
 */
async function ensureNativeCaptureAccess(kind: CallKind): Promise<void> {
  const bridge = typeof window !== 'undefined' ? window.api : undefined
  if (!bridge?.requestAvAccess) return

  let audioGranted = true
  let videoGranted = true
  try {
    audioGranted = await bridge.requestAvAccess('audio')
    if (kind === 'video') {
      videoGranted = await bridge.requestAvAccess('video')
    }
  } catch {
    // Native command unavailable or errored — don't block the call, let
    // getUserMedia run and surface any real failure.
    return
  }

  if (!audioGranted || !videoGranted) {
    throw new MediaAccessError(messageForReason('denied', kind), 'denied', kind)
  }
}

function reasonFromDomException(err: DOMException): MediaAccessReason {
  switch (err.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'notFound'
    case 'NotReadableError':
    case 'AbortError':
      return 'inUse'
    default:
      return 'unknown'
  }
}

function messageForReason(reason: MediaAccessReason, kind: CallKind): string {
  const devices = kind === 'video' ? 'camera/microphone' : 'microphone'
  switch (reason) {
    case 'denied':
      return `${
        kind === 'video' ? 'Camera/microphone' : 'Microphone'
      } access is blocked. Turn it on in System Settings to start the call.`
    case 'notFound':
      return kind === 'video'
        ? 'No camera or microphone was found.'
        : 'No microphone was found.'
    case 'inUse':
      return `Your ${devices} is being used by another app. Close it and try again.`
    case 'unsupported':
      return 'Audio/video calling is not supported in this environment.'
    default:
      return `Couldn't access your ${devices}.`
  }
}

/**
 * Requests the local microphone (and camera for video calls) via getUserMedia.
 * Audio always uses echo cancellation / noise suppression / auto gain.
 *
 * Runs a native macOS permission pre-flight first so the OS prompt fires and
 * Genisys registers in System Settings. Throws a {@link MediaAccessError} with a
 * typed reason if the device is unavailable or permission is denied.
 */
export async function getLocalMedia(kind: CallKind): Promise<MediaStream> {
  await ensureNativeCaptureAccess(kind)

  const wantsVideo = kind === 'video'
  const constraints: MediaStreamConstraints = {
    audio: AUDIO_CONSTRAINTS,
    video: wantsVideo ? VIDEO_CONSTRAINTS : false,
  }

  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new MediaAccessError(
      messageForReason('unsupported', kind),
      'unsupported',
      kind
    )
  }

  try {
    return await navigator.mediaDevices.getUserMedia(constraints)
  } catch (err) {
    if (err instanceof MediaAccessError) throw err
    const reason =
      err instanceof DOMException ? reasonFromDomException(err) : 'unknown'
    throw new MediaAccessError(messageForReason(reason, kind), reason, kind)
  }
}
