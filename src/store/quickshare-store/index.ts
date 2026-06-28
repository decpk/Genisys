import { create } from 'zustand'

import {
  quickShareAddFiles,
  quickShareAddText,
  quickShareDownloadAll,
  quickShareRemoveAll,
  quickShareRemoveItem,
  quickShareRevealItem,
  quickShareStart,
  quickShareStatus,
  quickShareStop,
  quickShareZipAndSend,
} from '@/components/QuickShare/api'

import type { QuickShareStore, QuickShareStoreState } from './types'

const initialState: QuickShareStoreState = {
  running: false,
  url: null,
  token: null,
  ip: null,
  port: null,
  storageDir: null,
  busy: false,
  error: null,
  clients: [],
  items: [],
}

/**
 * Desktop-side state for QuickShare (LAN file/text drop hub). The Rust backend
 * owns the HTTP + WebSocket server; this store mirrors its status and the shared
 * tray, and drives the QuickShare app pane. Tray + peer changes arrive as Tauri
 * events (wired in `useQuickShareData`) and land via `setItems` / `setClients`.
 */
export const useQuickShareStore = create<QuickShareStore>((set, get) => ({
  ...initialState,

  start: async (port) => {
    if (get().busy || get().running) return get().running
    set({ busy: true, error: null })
    try {
      const info = await quickShareStart(port)
      set({
        running: true,
        url: info.url,
        token: info.token,
        ip: info.ip,
        port: info.port,
        storageDir: info.storageDir,
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
      await quickShareStop()
    } catch (err) {
      console.error('[quickshare] stop failed', err)
    } finally {
      set({
        running: false,
        url: null,
        token: null,
        ip: null,
        port: null,
        storageDir: null,
        clients: [],
        items: [],
        busy: false,
        error: null,
      })
    }
  },

  refreshStatus: async () => {
    try {
      const status = await quickShareStatus()
      set({
        running: status.running,
        url: status.url,
        token: status.token,
        ip: status.ip,
        port: status.port,
        storageDir: status.storageDir,
        clients: status.clients,
        items: status.items,
      })
    } catch (err) {
      console.error('[quickshare] refreshStatus failed', err)
    }
  },

  addFiles: async (paths, target) => {
    if (!paths.length) return 0
    try {
      return await quickShareAddFiles(paths, target)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
      return 0
    }
  },

  addText: async (text, target) => {
    const trimmed = text.trim()
    if (!trimmed) return false
    try {
      await quickShareAddText(trimmed, target)
      return true
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
      return false
    }
  },

  removeItem: async (itemId) => {
    try {
      await quickShareRemoveItem(itemId)
    } catch (err) {
      console.error('[quickshare] removeItem failed', err)
    }
  },

  removeAll: async () => {
    try {
      return await quickShareRemoveAll()
    } catch (err) {
      console.error('[quickshare] removeAll failed', err)
      return 0
    }
  },

  revealItem: async (itemId) => {
    try {
      await quickShareRevealItem(itemId)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
    }
  },

  downloadAll: async () => {
    try {
      return await quickShareDownloadAll()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
      return null
    }
  },

  zipAndSend: async (target) => {
    try {
      return await quickShareZipAndSend(target)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) })
      return null
    }
  },

  setError: (error) => set({ error }),
  setClients: (clients) => set({ clients }),
  setItems: (items) => set({ items }),
}))
