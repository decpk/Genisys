import type { Theme } from '@/themes/themes.types'

export interface ThemeCatalogState {
  customThemes: Theme[]
  isLoaded: boolean
}

export interface ThemeCatalogActions {
  init: () => Promise<void>
  upsert: (theme: Theme) => Promise<void>
  remove: (id: string) => Promise<void>
}

export type ThemeCatalogGet = () => ThemeCatalogState
export type ThemeCatalogSet = (partial: Partial<ThemeCatalogState>) => void
