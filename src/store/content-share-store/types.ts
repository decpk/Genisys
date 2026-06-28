import type {
  ContentSharePeer,
  ContentShareIncoming,
  NotesShareKind,
  SendResult,
} from '@/components/ContentShare/api'

export interface ContentShareStoreState {
  /** Whether the local LAN service (HTTP + mDNS) is running. */
  running: boolean
  /** True while a start request is in flight. */
  starting: boolean
  /** This device's stable id (available even when stopped). */
  deviceId: string | null
  /** This device's display name shown in other devices' pickers. */
  deviceName: string | null
  ip: string | null
  port: number | null
  /** Genisys devices currently discovered on the LAN. */
  devices: ContentSharePeer[]
  /** Incoming offers awaiting the user's accept/decline (FIFO). */
  incoming: ContentShareIncoming[]
}

export interface ContentShareStoreActions {
  start: () => Promise<boolean>
  stop: () => Promise<void>
  refreshStatus: () => Promise<void>
  refreshDevices: () => Promise<void>
  setDeviceName: (name: string) => Promise<void>
  enqueueIncoming: (incoming: ContentShareIncoming) => void
  respond: (transferId: string, accept: boolean) => Promise<void>
  sendBook: (deviceId: string, bookId: string) => Promise<SendResult>
  sendNotes: (deviceId: string, kind: NotesShareKind, id?: string) => Promise<SendResult>
}

export type ContentShareStore = ContentShareStoreState & ContentShareStoreActions
