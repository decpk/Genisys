import { create } from 'zustand'

import { initThemeCatalogAction } from './theme-catalog-store/actions/initThemeCatalog'
import { upsertCustomThemeAction } from './theme-catalog-store/actions/upsertCustomTheme'
import { removeCustomThemeAction } from './theme-catalog-store/actions/removeCustomTheme'
import type {
  ThemeCatalogActions,
  ThemeCatalogState,
} from './theme-catalog-store/theme-catalog-store.types'

export const useThemeCatalogStore = create<ThemeCatalogState & ThemeCatalogActions>()((set, get) => ({
  customThemes: [],
  isLoaded: false,
  init: () => initThemeCatalogAction(set),
  upsert: (theme) => upsertCustomThemeAction(get, set, theme),
  remove: (id) => removeCustomThemeAction(get, set, id),
}))
