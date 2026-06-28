// Shared TypeScript types for the remote-terminal feature. Mirror the Rust
// serde structs (camelCase) in `src-tauri/src/commands/remote_terminal/types.rs`.

export type RemoteSessionMode = 'mirror' | 'dedicated'

export interface RemoteStartInfo {
  /** Full URL (with embedded token) to encode in the QR code. */
  url: string
  ip: string
  port: number
  token: string
}

export interface RemoteClient {
  clientId: string
  ip: string
  /** Unix epoch milliseconds when the device connected. */
  connectedAt: number
}

/** Host-controlled permissions governing what approved remote devices may do. */
export interface RemotePermissions {
  /** Whether a remote device may open new shells (the "+" button). */
  allowNewTab: boolean
  /** Whether a remote device may close / delete tabs (the "x" control). */
  allowCloseTab: boolean
}

export interface RemoteTerminalStatus {
  running: boolean
  url: string | null
  ip: string | null
  port: number | null
  token: string | null
  clients: RemoteClient[]
  permissions: RemotePermissions
}

export interface RemoteApprovalRequest {
  requestId: string
  ip: string
}
