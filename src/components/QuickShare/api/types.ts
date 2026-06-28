// Shared TypeScript types for the QuickShare feature. Mirror the Rust serde
// structs (camelCase) in `src-tauri/src/commands/quickshare/types.rs`.

export interface QuickShareTrayItem {
  id: string
  /** "file" | "text". */
  kind: 'file' | 'text'
  /** File name, or a short preview for a text snippet. */
  name: string
  size: number
  mime: string
  /** Friendly label for the sender ("This device" or a device name). */
  senderLabel: string
  /** Stable id of the sending device, or "__host__" for the desktop. */
  senderId: string
  /** Recipient: a device id, or "everyone". */
  target: string
  /** Unix epoch milliseconds when the item was added. */
  createdAt: number
  /** Present for text snippets only. */
  text?: string
}

export interface QuickShareClient {
  /** Per-connection id (one per open socket). */
  clientId: string
  /** Stable device id (survives reconnects); the recipient-targeting key. */
  deviceId: string
  /** Friendly device name shown in the recipient picker. */
  name: string
  ip: string
  /** Unix epoch milliseconds when the device connected. */
  connectedAt: number
}

export interface QuickShareStartInfo {
  /** Full URL (with embedded token) to encode in the QR code. */
  url: string
  ip: string
  port: number
  token: string
  /** Absolute path of the folder where received files are saved. */
  storageDir: string
}

export interface QuickShareStatus {
  running: boolean
  url: string | null
  ip: string | null
  port: number | null
  token: string | null
  storageDir: string | null
  clients: QuickShareClient[]
  items: QuickShareTrayItem[]
}
