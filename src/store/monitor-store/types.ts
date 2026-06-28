import type { MonitorApprovalRequest, MonitorClient } from '@/components/Monitor/api'

export interface MonitorStoreState {
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
  clients: MonitorClient[]
  pendingApprovals: MonitorApprovalRequest[]
}

export interface MonitorStoreActions {
  openPanel: () => void
  closePanel: () => void
  /** Start the LAN server. (Capture is started by the app before this.) */
  start: (port?: number) => Promise<boolean>
  /** Stop the LAN server. (Capture is stopped by the app after this.) */
  stop: () => Promise<void>
  refreshStatus: () => Promise<void>
  approve: (requestId: string) => Promise<void>
  deny: (requestId: string) => Promise<void>
  disconnectClient: (clientId: string) => Promise<void>
  setError: (error: string | null) => void
  // ── event-driven (internal) setters ──────────────────────────────────────
  setClients: (clients: MonitorClient[]) => void
  addPendingApproval: (approval: MonitorApprovalRequest) => void
  removePendingApproval: (requestId: string) => void
}

export type MonitorStore = MonitorStoreState & MonitorStoreActions
