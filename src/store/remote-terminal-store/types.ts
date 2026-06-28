import type {
  RemoteApprovalRequest,
  RemoteClient,
  RemotePermissions,
} from '@/components/Terminal/api/remote'

export interface RemoteTerminalStoreState {
  // ── server status ──────────────────────────────────────
  running: boolean
  url: string | null
  token: string | null
  ip: string | null
  port: number | null
  // ── ui ────────────────────────────────────────────
  panelOpen: boolean
  busy: boolean
  error: string | null
  // ── live data (initialised to [] so selectors stay reference-stable) ─────
  clients: RemoteClient[]
  pendingApprovals: RemoteApprovalRequest[]
  // ── host-controlled device permissions (persisted locally) ────────────
  permissions: RemotePermissions
}

export interface RemoteTerminalStoreActions {
  openPanel: () => void
  closePanel: () => void
  start: (port?: number) => Promise<void>
  stop: () => Promise<void>
  refreshStatus: () => Promise<void>
  approve: (requestId: string) => Promise<void>
  deny: (requestId: string) => Promise<void>
  disconnectClient: (clientId: string) => Promise<void>
  /** Update remote-device permissions (persisted locally + pushed to the server). */
  setPermissions: (permissions: RemotePermissions) => void
  // ── event-driven (internal) setters ──────────────────────────────────────
  setClients: (clients: RemoteClient[]) => void
  addPendingApproval: (approval: RemoteApprovalRequest) => void
  removePendingApproval: (requestId: string) => void
}

export type RemoteTerminalStore = RemoteTerminalStoreState & RemoteTerminalStoreActions
