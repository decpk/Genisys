/** Shared types for the Content Share API layer (mirrors the Rust wire shapes). */

export interface ContentSharePeer {
  deviceId: string
  deviceName: string
  host: string
  port: number
}

export interface ContentShareStatus {
  running: boolean
  deviceId: string
  deviceName: string
  ip: string | null
  port: number | null
  peers: ContentSharePeer[]
}

export interface ContentShareManifest {
  kind: 'library' | 'notes'
  title: string
  summary: string
  sizeBytes: number
}

export interface ContentShareIncoming {
  transferId: string
  senderDeviceId: string
  senderDeviceName: string
  manifest: ContentShareManifest
}

export interface ContentShareReceived {
  kind: 'library' | 'notes'
  title: string
  senderDeviceName: string
}

export interface ContentShareSendProgress {
  deviceId: string
  phase: 'waiting' | 'uploading'
  sent: number
  total: number
}

/** The granularity at which a notes selection can be shared. */
export type NotesShareKind = 'note' | 'topic' | 'section' | 'notebook' | 'project' | 'all'

/** Outcome of a send attempt. `accepted` is false when the receiver declined. */
export interface SendResult {
  accepted: boolean
}
