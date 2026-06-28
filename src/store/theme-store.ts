import { create } from 'zustand'

import { THEMES, applyTheme } from '@/themes'
import { findThemeById } from '@/themes/utils/findThemeById'
import { APP_DATA_DEFAULTS, loadAppData, patchAppData } from './app-data'
import { useSettingsStore } from './settings-store'
import { useThemeCatalogStore } from './theme-catalog-store'

// ── Types ────────────────────────────────────────────────────────────

export type ThemeChangeSource = 'manual' | 'scheduler'

interface ThemeState {
  activeThemeId: string
}

interface ThemeActions {
  setTheme: (themeId: string, source?: ThemeChangeSource) => void
  /** Apply a theme visually without persisting (for keyboard preview). */
  previewTheme: (themeId: string) => void
  /** Revert to the committed active theme (undo a preview). */
  revertPreview: () => void
  /** Call once on app boot to apply the persisted theme. */
  initTheme: () => Promise<void>
}

// ── Store ────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState & ThemeActions>()((set, get) => ({
  activeThemeId: APP_DATA_DEFAULTS.theme,

  setTheme: (themeId, source = 'manual') => {
    if (get().activeThemeId === themeId) return
    const theme = findThemeById(themeId)
    if (!theme) return

    applyTheme(theme)
    set({ activeThemeId: themeId })
    patchAppData((d) => {
      d.theme = themeId
    })

    if (source === 'manual') {
      const settings = useSettingsStore.getState()
      if (settings.autoThemeEnabled && settings.autoThemePauseOnManualChange) {
        settings.setAutoThemeEnabled(false)
      }
    }
  },

  previewTheme: (themeId) => {
    const theme = findThemeById(themeId)
    if (theme) applyTheme(theme)
  },

  revertPreview: () => {
    const theme = findThemeById(get().activeThemeId)
    if (theme) applyTheme(theme)
  },

  initTheme: async () => {
    // Load custom themes from disk first so a custom theme id can be resolved.
    const catalog = useThemeCatalogStore.getState()
    if (!catalog.isLoaded) {
      await catalog.init()
    }

    const data = await loadAppData()
    const theme = findThemeById(data.theme) ?? THEMES[0]

    applyTheme(theme)
    set({ activeThemeId: theme.id })

    // Only persist if the resolved theme differs (e.g. saved id was invalid)
    if (data.theme !== theme.id) {
      patchAppData((d) => {
        d.theme = theme.id
      })
    }
  }
}))
