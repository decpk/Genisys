import { create } from 'zustand'

import { loadAppData, patchAppData } from '@/store/app-data'

// ── Types ────────────────────────────────────────────────────────────

interface KeyboardState {
  isLoaded: boolean
  overrides: Record<string, string>
  disabledShortcuts: string[]
}

interface KeyboardActions {
  initKeyboardShortcuts: () => Promise<void>
  setOverride: (id: string, keys: string) => void
  removeOverride: (id: string) => void
  toggleShortcut: (id: string) => void
  resetAll: () => void
}

// ── Store ────────────────────────────────────────────────────────────

export const useKeyboardStore = create<KeyboardState & KeyboardActions>()((set, get) => ({
  isLoaded: false,
  overrides: {},
  disabledShortcuts: [],

  initKeyboardShortcuts: async () => {
    const appData = await loadAppData()
    const { keyboard } = appData.settings
    set({
      isLoaded: true,
      overrides: keyboard.overrides,
      disabledShortcuts: keyboard.disabled,
    })
  },

  setOverride: (id, keys) => {
    const current = get().overrides
    if (current[id] === keys) return
    const next = { ...current, [id]: keys }
    set({ overrides: next })
    patchAppData((d) => {
      d.settings.keyboard.overrides = next
    })
  },

  removeOverride: (id) => {
    const current = get().overrides
    if (!(id in current)) return
    const next = { ...current }
    delete next[id]
    set({ overrides: next })
    patchAppData((d) => {
      d.settings.keyboard.overrides = next
    })
  },

  toggleShortcut: (id) => {
    const current = get().disabledShortcuts
    const isDisabled = current.includes(id)
    const next = isDisabled ? current.filter((s) => s !== id) : [...current, id]
    set({ disabledShortcuts: next })
    patchAppData((d) => {
      d.settings.keyboard.disabled = next
    })
  },

  resetAll: () => {
    set({ overrides: {}, disabledShortcuts: [] })
    patchAppData((d) => {
      d.settings.keyboard.overrides = {}
      d.settings.keyboard.disabled = []
    })
  },
}))
