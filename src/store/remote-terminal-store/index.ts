import { create } from 'zustand'

import {
  remoteTerminalApprove,
  remoteTerminalDeny,
  remoteTerminalDisconnect,
  remoteTerminalSetPermissions,
  remoteTerminalStart,
  remoteTerminalStatus,
  remoteTerminalStop,
} from '@/components/Terminal/api/remote'
import type { RemotePermissions } from '@/components/Terminal/api/remote'

import type { RemoteTerminalStore, RemoteTerminalStoreState } from './types'

const PERMISSIONS_STORAGE_KEY = 'genisys.remoteTerminal.permissions'
/** Backward-compatible defaults: new tabs allowed (as before), close disabled. */
const DEFAULT_PERMISSIONS: RemotePermissions = {
  allowNewTab: true,
  allowCloseTab: false,
}

function loadPermissions(): RemotePermissions {
  try {
    const raw = localStorage.getItem(PERMISSIONS_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PERMISSIONS }
    const parsed = JSON.parse(raw) as Partial<RemotePermissions>
    return {
      allowNewTab:
        typeof parsed.allowNewTab === 'boolean'
          ? parsed.allowNewTab
          : DEFAULT_PERMISSIONS.allowNewTab,
      allowCloseTab:
        typeof parsed.allowCloseTab === 'boolean'
          ? parsed.allowCloseTab
          : DEFAULT_PERMISSIONS.allowCloseTab,
    }
  } catch {
    return { ...DEFAULT_PERMISSIONS }
  }
}

function savePermissions(permissions: RemotePermissions): void {
  try {
    localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions))
  } catch {
    /* ignore persistence failures (e.g. storage disabled) */
  }
}

const initialState: RemoteTerminalStoreState = {
  running: false,
  url: null,
  token: null,
  ip: null,
  port: null,
  panelOpen: false,
  busy: false,
  error: null,
  clients: [],
  pendingApprovals: [],
  permissions: loadPermissions(),
}

/**
 * Desktop-side state for Remote Terminal Access. The backend owns the server;
 * this store mirrors its status, drives the Share panel, and queues incoming
 * approval requests. Event listeners are wired by `useRemoteShareData`.
 */
export const useRemoteTerminalStore = create<RemoteTerminalStore>((set, get) => ({
  ...initialState,

  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),

  start: async (port) => {
    if (get().busy || get().running) return
    set({ busy: true, error: null })
    try {
      const info = await remoteTerminalStart(port)
      set({
        running: true,
        url: info.url,
        token: info.token,
        ip: info.ip,
        port: info.port,
        busy: false,
      })
      // Push the host's current permissions so the freshly started server
      // enforces them from the very first connection.
      try {
        await remoteTerminalSetPermissions(get().permissions)
      } catch (err) {
        console.error('[remote-terminal] initial setPermissions failed', err)
      }
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : String(err) })
    }
  },

  stop: async () => {
    if (get().busy) return
    set({ busy: true })
    try {
      await remoteTerminalStop()
    } catch (err) {
      console.error('[remote-terminal] stop failed', err)
    } finally {
      set({
        running: false,
        url: null,
        token: null,
        ip: null,
        port: null,
        clients: [],
        pendingApprovals: [],
        busy: false,
        error: null,
      })
    }
  },

  refreshStatus: async () => {
    try {
      const status = await remoteTerminalStatus()
      set({
        running: status.running,
        url: status.url,
        token: status.token,
        ip: status.ip,
        port: status.port,
        clients: status.clients,
      })
    } catch (err) {
      console.error('[remote-terminal] refreshStatus failed', err)
    }
  },

  approve: async (requestId) => {
    get().removePendingApproval(requestId)
    try {
      await remoteTerminalApprove(requestId)
    } catch (err) {
      console.error('[remote-terminal] approve failed', err)
    }
  },

  deny: async (requestId) => {
    get().removePendingApproval(requestId)
    try {
      await remoteTerminalDeny(requestId)
    } catch (err) {
      console.error('[remote-terminal] deny failed', err)
    }
  },

  disconnectClient: async (clientId) => {
    try {
      await remoteTerminalDisconnect(clientId)
    } catch (err) {
      console.error('[remote-terminal] disconnect failed', err)
    }
  },

  setPermissions: (permissions) => {
    // Optimistically update + persist locally (the desktop is the source of
    // truth), then push to the backend. Harmless while stopped — the value is
    // retained and applied on the next start.
    savePermissions(permissions)
    set({ permissions })
    void remoteTerminalSetPermissions(permissions).catch((err) => {
      console.error('[remote-terminal] setPermissions failed', err)
    })
  },

  setClients: (clients) => set({ clients }),

  addPendingApproval: (approval) =>
    set((state) => {
      if (state.pendingApprovals.some((a) => a.requestId === approval.requestId)) {
        return state
      }
      return { pendingApprovals: [...state.pendingApprovals, approval] }
    }),

  removePendingApproval: (requestId) =>
    set((state) => ({
      pendingApprovals: state.pendingApprovals.filter((a) => a.requestId !== requestId),
    })),
}))
