import type { CallKind, IceSignal } from '@/components/Messages/Messages.types'
import { createPeerConnection } from './utils/createPeerConnection'
import { getLocalMedia } from './utils/getLocalMedia'
import { getDisplayMedia } from './utils/getDisplayMedia'
import { stopStream } from './utils/stopStream'

interface PeerCallConfig {
  onIceCandidate: (c: RTCIceCandidate) => void
  onRemoteStream: (s: MediaStream) => void
  onConnectionStateChange: (state: RTCPeerConnectionState) => void
}

/**
 * Wraps a single LAN-only RTCPeerConnection for a 1:1 audio/video call.
 * MediaStreams are held as private instance fields and must NEVER be placed in
 * the (serializable) zustand store — only the engine/overlay reads them via the
 * getters and attaches them to <video> elements through refs.
 */
export class PeerCall {
  private readonly pc: RTCPeerConnection
  private readonly config: PeerCallConfig
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private screenStream: MediaStream | null = null
  private cameraTrack: MediaStreamTrack | null = null

  constructor(config: PeerCallConfig) {
    this.config = config
    this.pc = createPeerConnection()
    this.pc.onicecandidate = (event) => {
      if (event.candidate) this.config.onIceCandidate(event.candidate)
    }
    this.pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track])
      this.remoteStream = stream
      this.config.onRemoteStream(stream)
    }
    this.pc.onconnectionstatechange = () => {
      this.config.onConnectionStateChange(this.pc.connectionState)
    }
  }

  async start(kind: CallKind): Promise<MediaStream> {
    const stream = await getLocalMedia(kind)
    this.localStream = stream
    for (const track of stream.getTracks()) {
      this.pc.addTrack(track, stream)
    }
    return stream
  }

  async createOffer(): Promise<string> {
    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)
    return offer.sdp ?? ''
  }

  async createAnswer(): Promise<string> {
    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)
    return answer.sdp ?? ''
  }

  async acceptOffer(sdp: string): Promise<void> {
    await this.pc.setRemoteDescription({ type: 'offer', sdp })
  }

  async acceptAnswer(sdp: string): Promise<void> {
    await this.pc.setRemoteDescription({ type: 'answer', sdp })
  }

  async addIce(sig: IceSignal): Promise<void> {
    await this.pc.addIceCandidate({
      candidate: sig.candidate,
      sdpMid: sig.sdpMid,
      sdpMLineIndex: sig.sdpMLineIndex,
    })
  }

  async toggleMic(on: boolean): Promise<void> {
    this.setTracksEnabled('audio', on)
  }

  async toggleCamera(on: boolean): Promise<void> {
    this.setTracksEnabled('video', on)
  }

  async startScreenShare(): Promise<void> {
    const sender = this.getVideoSender()
    if (!sender) return
    const screen = await getDisplayMedia()
    const screenTrack = screen.getVideoTracks()[0]
    if (!screenTrack) {
      stopStream(screen)
      return
    }
    this.cameraTrack = sender.track
    this.screenStream = screen
    await sender.replaceTrack(screenTrack)
    screenTrack.addEventListener('ended', () => {
      void this.stopScreenShare()
    })
  }

  async stopScreenShare(): Promise<void> {
    const sender = this.getVideoSender()
    if (sender) await sender.replaceTrack(this.cameraTrack)
    stopStream(this.screenStream)
    this.screenStream = null
    this.cameraTrack = null
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  close(): void {
    stopStream(this.localStream)
    stopStream(this.screenStream)
    this.localStream = null
    this.screenStream = null
    this.remoteStream = null
    this.cameraTrack = null
    this.pc.close()
  }

  private setTracksEnabled(kind: 'audio' | 'video', on: boolean): void {
    if (!this.localStream) return
    const tracks =
      kind === 'audio'
        ? this.localStream.getAudioTracks()
        : this.localStream.getVideoTracks()
    for (const track of tracks) {
      track.enabled = on
    }
  }

  private getVideoSender(): RTCRtpSender | null {
    return this.pc.getSenders().find((s) => s.track?.kind === 'video') ?? null
  }
}
