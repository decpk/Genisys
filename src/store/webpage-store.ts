import { create } from 'zustand'

import type { SavedWebpage } from './webpage-store.types'

// ─── State ───────────────────────────────────────────────────────

interface WebpageState {
  webpages: SavedWebpage[]
  isLoaded: boolean
  activeWebpageId: string | null
  isLoadingContent: boolean
  isSaving: boolean
}

interface WebpageActions {
  loadWebpages: () => Promise<void>
  saveWebpage: (url: string, name: string) => Promise<SavedWebpage>
  saveWebpageFromHtml: (
    html: string,
    name: string,
    sourceUrl: string,
  ) => Promise<SavedWebpage>
  removeWebpage: (id: string) => Promise<void>
  updateWebpage: (id: string) => Promise<void>
  renameWebpage: (id: string, name: string) => Promise<void>
  updateWebpageContent: (id: string, html: string) => Promise<void>
  selectWebpage: (id: string | null) => void
}

// ─── Store ───────────────────────────────────────────────────────

export const useWebpageStore = create<WebpageState & WebpageActions>()(
  (set) => ({
    webpages: [],
    isLoaded: false,
    activeWebpageId: null,
    isLoadingContent: false,
    isSaving: false,

    loadWebpages: async () => {
      const webpages = await window.api.loadWebpages()
      set({ webpages, isLoaded: true })
    },

    saveWebpage: async (url: string, name: string) => {
      set({ isSaving: true })
      try {
        const now = new Date().toISOString()
        const result = await window.api.saveWebpage(url, name, now)
        const webpage = result.webpage as SavedWebpage
        set((s) => ({
          webpages: [webpage, ...s.webpages],
          isSaving: false,
        }))
        return webpage
      } catch (e) {
        set({ isSaving: false })
        throw e
      }
    },

    saveWebpageFromHtml: async (
      html: string,
      name: string,
      sourceUrl: string,
    ) => {
      set({ isSaving: true })
      try {
        const now = new Date().toISOString()
        const result = await window.api.saveWebpageFromHtml(
          html,
          name,
          sourceUrl,
          now,
        )
        const webpage = result.webpage as SavedWebpage
        set((s) => ({
          webpages: [webpage, ...s.webpages],
          isSaving: false,
        }))
        return webpage
      } catch (e) {
        set({ isSaving: false })
        throw e
      }
    },

    removeWebpage: async (id: string) => {
      await window.api.removeWebpage(id)
      set((s) => ({
        webpages: s.webpages.filter((w) => w.id !== id),
        activeWebpageId: s.activeWebpageId === id ? null : s.activeWebpageId,
      }))
    },

    updateWebpage: async (id: string) => {
      const now = new Date().toISOString()
      const result = await window.api.updateWebpage(id, now)
      set((s) => ({
        webpages: s.webpages.map((w) =>
          w.id === id
            ? { ...w, fileSize: result.fileSize, updatedAt: result.updatedAt }
            : w,
        ),
      }))
    },

    renameWebpage: async (id: string, name: string) => {
      const now = new Date().toISOString()
      await window.api.renameWebpage(id, name, now)
      set((s) => ({
        webpages: s.webpages.map((w) =>
          w.id === id ? { ...w, name, updatedAt: now } : w,
        ),
      }))
    },

    updateWebpageContent: async (id: string, html: string) => {
      const now = new Date().toISOString()
      const result = await window.api.updateWebpageContent(id, html, now)
      set((s) => ({
        webpages: s.webpages.map((w) =>
          w.id === id
            ? { ...w, fileSize: result.fileSize, updatedAt: result.updatedAt }
            : w,
        ),
      }))
    },

    selectWebpage: (id: string | null) => {
      set({ activeWebpageId: id })
    },
  }),
)

export type { SavedWebpage } from './webpage-store.types'
