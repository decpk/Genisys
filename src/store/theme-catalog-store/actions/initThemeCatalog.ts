import { listCustomThemes } from '@/themes/api'

import type { ThemeCatalogSet } from '../theme-catalog-store.types'

/** Loads custom themes from disk into the catalog store. */
export async function initThemeCatalogAction(set: ThemeCatalogSet): Promise<void> {
  try {
    const themes = await listCustomThemes()
    set({ customThemes: themes, isLoaded: true })
  } catch (err) {
    console.error('[theme-catalog] failed to load custom themes', err)
    set({ customThemes: [], isLoaded: true })
  }
}
