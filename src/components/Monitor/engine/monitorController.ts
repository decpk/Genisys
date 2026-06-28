// Monitor capture engine — a module-level singleton (NOT a zustand store) that
// owns the desktop's camera + mic capture, a software pan/tilt/zoom (PTZ)
// pipeline, and one outbound WebRTC peer per connected viewer. Live media
// objects (`MediaStream`, `RTCPeerConnection`) are deliberately kept out of
// React state to avoid render-loop pitfalls; the UI only reads the preview
// stream (effect keyed on the server `running` flag) and the viewer list (from
// the store, via Tauri events).
//
// The desktop is the WebRTC *offerer*: ONE capture is fanned out to N viewers,
// each its own peer connection keyed by `clientId`. Signaling (SDP + ICE) is
// relayed to a specific viewer via `monitorSendSignal`; the actual audio/video
// flows peer-to-peer (LAN host candidates only).
//
// Digital PTZ: the raw camera frame is drawn onto an offscreen <canvas> cropped
// to a movable/zoomable region, and `canvas.captureStream()` produces the video
// track that is actually sent to viewers (audio stays the raw mic track). Remote
// viewers re-frame the feed by sending `{ kind: 'control', zoom, cx, cy }` over
// the existing signaling channel — there is ONE shared framing for all viewers.

import { createPeerConnection } from '@/components/Messages/call/utils/createPeerConnection'
import { getLocalMedia } from '@/components/Messages/call/utils/getLocalMedia'
import { monitorSendSignal, type MonitorSignal } from '@/components/Monitor/api'

// Output resolution of the processed (cropped) stream sent to viewers.
const OUTPUT_W = 1280
const OUTPUT_H = 720
const OUTPUT_FPS = 30
const MIN_ZOOM = 1
const MAX_ZOOM = 5

let localStream: MediaStream | null = null
const peers = new Map<string, RTCPeerConnection>()

// ── Digital PTZ pipeline ──────────────────────────────────────────────────
let outputStream: MediaStream | null = null
let sourceVideo: HTMLVideoElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let rafId: number | null = null

// Shared crop state. `zoom` >= 1 (1 = full frame); `cx`/`cy` in [0,1] are the
// normalized center of the cropped region within the source frame.
let zoom = 1
let cx = 0.5
let cy = 0.5

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/**
 * Begin capturing the front camera + microphone and build the PTZ pipeline.
 * Idempotent — returns the existing stream if already capturing. Throws a
 * `MediaAccessError` (from `getLocalMedia`) if permission is denied or no device
 * is available; the caller surfaces a friendly message.
 */
async function startCapture(): Promise<MediaStream> {
  if (localStream) return localStream
  // 'video' => camera + microphone (audio is always captured).
  const stream = await getLocalMedia('video')
  localStream = stream

  // Ask for a higher capture resolution so digital zoom keeps detail. Best
  // effort — silently ignored by cameras that can't honor it.
  const videoTrack = stream.getVideoTracks()[0]
  if (videoTrack) {
    try {
      await videoTrack.applyConstraints({
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      })
    } catch {
      /* keep whatever resolution the camera gave us */
    }
  }

  buildPipeline()
  return stream
}

/**
 * Wire the raw camera through an offscreen canvas so the feed can be cropped /
 * zoomed / panned. Sets `outputStream` to the processed (canvas) video + the raw
 * mic audio. If the browser can't capture a canvas stream we leave `outputStream`
 * null and fall back to streaming the raw camera (no PTZ).
 */
function buildPipeline(): void {
  if (!localStream) return

  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.srcObject = new MediaStream(localStream.getVideoTracks())
  void video.play().catch(() => {})
  sourceVideo = video

  const c = document.createElement('canvas')
  c.width = OUTPUT_W
  c.height = OUTPUT_H
  const context = c.getContext('2d')
  if (!context || typeof c.captureStream !== 'function') {
    // Canvas capture unsupported — stream the raw camera instead (no PTZ).
    sourceVideo = null
    ctx = null
    return
  }
  ctx = context
  // Prime with black so the captured track has a frame before the camera warms.
  context.fillStyle = '#000'
  context.fillRect(0, 0, OUTPUT_W, OUTPUT_H)

  const captured = c.captureStream(OUTPUT_FPS)
  const out = new MediaStream()
  for (const t of captured.getVideoTracks()) out.addTrack(t)
  for (const t of localStream.getAudioTracks()) out.addTrack(t)
  outputStream = out

  rafId = requestAnimationFrame(renderFrame)
}

/** Draw one cropped frame of the camera onto the canvas (the render loop). */
function renderFrame(): void {
  if (!ctx || !sourceVideo) return
  const vw = sourceVideo.videoWidth
  const vh = sourceVideo.videoHeight
  if (vw > 0 && vh > 0) {
    // Largest region of the source matching the output aspect ratio (cover),
    // then shrunk by `zoom` and positioned by the normalized center cx/cy.
    const outAR = OUTPUT_W / OUTPUT_H
    const srcAR = vw / vh
    let baseW: number
    let baseH: number
    if (srcAR > outAR) {
      baseH = vh
      baseW = vh * outAR
    } else {
      baseW = vw
      baseH = vw / outAR
    }
    const sw = baseW / zoom
    const sh = baseH / zoom
    const sx = clamp(cx * vw - sw / 2, 0, vw - sw)
    const sy = clamp(cy * vh - sh / 2, 0, vh - sh)
    ctx.drawImage(sourceVideo, sx, sy, sw, sh, 0, 0, OUTPUT_W, OUTPUT_H)
  }
  rafId = requestAnimationFrame(renderFrame)
}

/** Update the shared crop (zoom + normalized center), clamped to valid ranges. */
function setView(nextZoom: number, nextCx: number, nextCy: number): void {
  zoom = clamp(Number.isFinite(nextZoom) ? nextZoom : 1, MIN_ZOOM, MAX_ZOOM)
  cx = clamp(Number.isFinite(nextCx) ? nextCx : 0.5, 0, 1)
  cy = clamp(Number.isFinite(nextCy) ? nextCy : 0.5, 0, 1)
}

function isCapturing(): boolean {
  return localStream !== null
}

/** The stream to show in the local desktop preview — i.e. what viewers see. */
function getPreviewStream(): MediaStream | null {
  return outputStream ?? localStream
}

function viewerCount(): number {
  return peers.size
}

/**
 * A viewer connected and was approved: build a peer connection, add the
 * processed (PTZ) video + mic tracks, and send it an offer. The viewer answers +
 * trickles ICE back via `handleSignal`.
 */
async function addViewer(clientId: string): Promise<void> {
  if (!localStream) return // capture not active — nothing to stream yet
  removeViewer(clientId) // drop any stale peer for this id first

  const pc = createPeerConnection()
  peers.set(clientId, pc)

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      void monitorSendSignal(clientId, {
        kind: 'ice',
        candidate: e.candidate.candidate,
        sdpMid: e.candidate.sdpMid,
        sdpMLineIndex: e.candidate.sdpMLineIndex,
      })
    }
  }
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed') {
      // The viewer will retry from its side (re-opening the socket emits a fresh
      // client-connected). Drop the dead peer so a retry starts clean.
      removeViewer(clientId)
    }
  }

  // Send the processed (cropped) output when available; otherwise the raw camera.
  const streamForViewer = outputStream ?? localStream
  for (const track of streamForViewer.getTracks()) {
    pc.addTrack(track, streamForViewer)
  }

  try {
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await monitorSendSignal(clientId, { kind: 'offer', sdp: offer.sdp ?? '' })
  } catch (err) {
    console.error('[monitor] failed to create/send offer', err)
    removeViewer(clientId)
  }
}

/**
 * Apply a viewer's signaling reply (answer / ICE candidate) or a PTZ control
 * command. A control command re-frames the single shared capture for everyone.
 */
async function handleSignal(clientId: string, signal: MonitorSignal): Promise<void> {
  if (signal.kind === 'control') {
    setView(signal.zoom, signal.cx, signal.cy)
    return
  }
  const pc = peers.get(clientId)
  if (!pc) return
  try {
    if (signal.kind === 'answer') {
      await pc.setRemoteDescription({ type: 'answer', sdp: signal.sdp })
    } else if (signal.kind === 'ice' && signal.candidate) {
      await pc.addIceCandidate({
        candidate: signal.candidate,
        sdpMid: signal.sdpMid,
        sdpMLineIndex: signal.sdpMLineIndex,
      })
    }
    // A viewer-sent 'offer' is unexpected (desktop is the sole offerer) — ignore.
  } catch (err) {
    console.error('[monitor] handleSignal error', err)
  }
}

/** Close + drop a single viewer's peer connection. */
function removeViewer(clientId: string): void {
  const pc = peers.get(clientId)
  if (pc) {
    pc.onicecandidate = null
    pc.onconnectionstatechange = null
    pc.ontrack = null
    try {
      pc.close()
    } catch {
      /* already closed */
    }
    peers.delete(clientId)
  }
}

/** Tear everything down: stop the render loop, close all peers, release media. */
function stopAll(): void {
  for (const pc of peers.values()) {
    pc.onicecandidate = null
    pc.onconnectionstatechange = null
    pc.ontrack = null
    try {
      pc.close()
    } catch {
      /* already closed */
    }
  }
  peers.clear()

  // Stop the PTZ pipeline (render loop + processed stream + source video).
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (outputStream) {
    for (const track of outputStream.getTracks()) {
      try {
        track.stop()
      } catch {
        /* already stopped */
      }
    }
    outputStream = null
  }
  if (sourceVideo) {
    try {
      sourceVideo.pause()
    } catch {
      /* ignore */
    }
    sourceVideo.srcObject = null
    sourceVideo = null
  }
  ctx = null
  zoom = 1
  cx = 0.5
  cy = 0.5

  if (localStream) {
    for (const track of localStream.getTracks()) {
      try {
        track.stop()
      } catch {
        /* already stopped */
      }
    }
    localStream = null
  }
}

export const monitorController = {
  startCapture,
  stopAll,
  getPreviewStream,
  isCapturing,
  viewerCount,
  addViewer,
  handleSignal,
  removeViewer,
}
