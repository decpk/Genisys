// Shared TypeScript types for the Monitor feature. Mirror the Rust serde
// structs (camelCase) in `src-tauri/src/commands/monitor/types.rs`.

export interface MonitorStartInfo {
  /** Full URL (with embedded token) to encode in the QR code. */
  url: string
  ip: string
  port: number
  token: string
}

export interface MonitorClient {
  clientId: string
  ip: string
  /** Unix epoch milliseconds when the device connected. */
  connectedAt: number
}

export interface MonitorStatus {
  running: boolean
  url: string | null
  ip: string | null
  port: number | null
  token: string | null
  clients: MonitorClient[]
}

export interface MonitorApprovalRequest {
  requestId: string
  ip: string
}

/** A WebRTC signaling payload exchanged (opaquely, via the server) between the
 *  desktop capturer and a browser viewer. `control` is a viewer-to-desktop PTZ
 *  command (digital pan/tilt/zoom): `zoom` >= 1 and `cx`/`cy` in [0,1] are the
 *  normalized center of the cropped region the desktop should show. */
export type MonitorSignal =
  | { kind: 'offer'; sdp: string }
  | { kind: 'answer'; sdp: string }
  | {
      kind: 'ice'
      candidate: string
      sdpMid: string | null
      sdpMLineIndex: number | null
    }
  | { kind: 'control'; zoom: number; cx: number; cy: number }

/** Payload of the `monitor-signal` event: a viewer's signal tagged with its
 *  originating client id. */
export interface MonitorSignalEvent {
  clientId: string
  data: MonitorSignal
}
