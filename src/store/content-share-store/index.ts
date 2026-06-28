import { create } from 'zustand'

import {
  contentShareListDevices,
  contentShareRespond,
  contentShareSendBook,
  contentShareSendNotes,
  contentShareSetDeviceName,
  contentShareStart,
  contentShareStatus,
  contentShareStop,
} from '@/components/ContentShare/api'

import type { ContentShareStore, ContentShareStoreState } from './types'

const initialState: ContentShareStoreState = {
  running: false,
  starting: false,
  deviceId: null,
  deviceName: null,
  ip: null,
  port: null,
  devices: [],
  incoming: [],
}

/**
 * Desktop-side state for Content Share (share whole books + notes between Genisys
 * devices on the LAN). The Rust backend owns the HTTP server + mDNS discovery;
 * this store mirrors its status and discovered peers, queues incoming offers for
 * the approval dialog, and drives the send actions. Device + offer changes
 * arrive as Tauri events (wired in `useContentShareData`).
 */
export const useContentShareStore = create<ContentShareStore>((set, get) => ({
  ...initialState,

  start: async () => {
    if (get().running || get().starting) return get().running
    set({ starting: true })
    try {
      const status = await contentShareStart()
      set({
        running: status.running,
        deviceId: status.deviceId,
        deviceName: status.deviceName,
        ip: status.ip,
        port: status.port,
        devices: status.peers,
        starting: false,
      })
      return true
    } catch (err) {
      console.error('[content-share] start failed', err)
      set({ starting: false })
      return false
    }
  },

  stop: async () => {
    try {
      await contentShareStop()
    } catch (err) {
      console.error('[content-share] stop failed', err)
    }
    set({ running: false, ip: null, port: null, devices: [] })
  },

  refreshStatus: async () => {
    try {
      const status = await contentShareStatus()
      set({
        running: status.running,
        deviceId: status.deviceId,
        deviceName: status.deviceName,
        ip: status.ip,
        port: status.port,
        devices: status.peers,
      })
    } catch (err) {
      console.error('[content-share] refreshStatus failed', err)
    }
  },

  refreshDevices: async () => {
    try {
      set({ devices: await contentShareListDevices() })
    } catch (err) {
      console.error('[content-share] refreshDevices failed', err)
    }
  },

  setDeviceName: async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      const updated = await contentShareSetDeviceName(trimmed)
      set({ deviceName: updated })
    } catch (err) {
      console.error('[content-share] setDeviceName failed', err)
    }
  },

  enqueueIncoming: (incoming) =>
    set((s) =>
      s.incoming.some((i) => i.transferId === incoming.transferId)
        ? s
        : { incoming: [...s.incoming, incoming] },
    ),

  respond: async (transferId, accept) => {
    try {
      await contentShareRespond(transferId, accept)
    } finally {
      set((s) => ({ incoming: s.incoming.filter((i) => i.transferId !== transferId) }))
    }
  },

  sendBook: async (deviceId, bookId) => contentShareSendBook(deviceId, bookId),

  sendNotes: async (deviceId, kind, id) => contentShareSendNotes(deviceId, kind, id),
}))
