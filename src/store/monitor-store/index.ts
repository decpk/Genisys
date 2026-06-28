import { create } from 'zustand'

import {
  monitorApprove,
  monitorDeny,
  monitorDisconnect,
  monitorStart,
  monitorStatus,
  monitorStop,
} from '@/components/Monitor/api'

import type { MonitorStore, MonitorStoreState } from './types'

const initialState: MonitorStoreState = {
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
}

/**
 * Desktop-side state for Monitor (LAN camera + mic streaming). The backend
 * owns the signaling server; this store mirrors its status, drives the Share
 * panel, and queues incoming approval requests. The webview-side camera/mic
 * capture + WebRTC peers live in `monitorController` and are orchestrated by
 * the Monitor app, which calls `start`/`stop` here for the server half.
 */
export const useMonitorStore = create<MonitorStore>((set, get) => ({
  ...initialState,

  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),

  start: async (port) => {
    if (get().busy || get().running) return get().running
    set({ busy: true, error: null })
    try {
      const info = await monitorStart(port)
      set({
        running: true,
        url: info.url,
        token: info.token,
        ip: info.ip,
        port: info.port,
        busy: false,
      })
      return true
    } catch (err) {
      set({ busy: false, error: err instanceof Error ? err.message : String(err) })
      return false
    }
  },

  stop: async () => {
    if (get().busy) return
    set({ busy: true })
    try {
      await monitorStop()
    } catch (err) {
      console.error('[monitor] stop failed', err)
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
      const status = await monitorStatus()
      set({
        running: status.running,
        url: status.url,
        token: status.token,
        ip: status.ip,
        port: status.port,
        clients: status.clients,
      })
    } catch (err) {
      console.error('[monitor] refreshStatus failed', err)
    }
  },

  approve: async (requestId) => {
    get().removePendingApproval(requestId)
    try {
      await monitorApprove(requestId)
    } catch (err) {
      console.error('[monitor] approve failed', err)
    }
  },

  deny: async (requestId) => {
    get().removePendingApproval(requestId)
    try {
      await monitorDeny(requestId)
    } catch (err) {
      console.error('[monitor] deny failed', err)
    }
  },

  disconnectClient: async (clientId) => {
    try {
      await monitorDisconnect(clientId)
    } catch (err) {
      console.error('[monitor] disconnect failed', err)
    }
  },

  setError: (error) => set({ error }),

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
