import { THEMES } from '@/themes'
import { useThemeStore } from '@/store/theme-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const themesSource: PaletteSource = {
  id: 'themes',
  kinds: ['theme'],
  getItems(): PaletteItem[] {
    try {
      const activeId = useThemeStore.getState().activeThemeId
      return THEMES.map((theme): PaletteItem => {
        const isCurrent = theme.id === activeId
        return {
          id: `theme:${theme.id}`,
          kind: 'theme',
          title: theme.name ?? theme.id,
          subtitle: isCurrent ? 'Current theme' : 'Theme',
          keywords: ['theme', 'color', 'colors', 'appearance', 'dark', 'light', 'mode', 'style', theme.id],
          group: 'theme',
          action: () => safeRun(() => useThemeStore.getState().setTheme(theme.id, 'manual')),
        }
      })
    } catch {
      return []
    }
  },
}
