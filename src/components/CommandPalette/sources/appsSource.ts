import { useNavigationStore } from '@/store/navigation-store'
import { useSettingsStore } from '@/store/settings-store'
import { INSTALLABLE_APP_VIEWS } from '@/store/settings-store/AppView.constants'

import { APP_REGISTRY } from '../utils/appRegistry'
import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const appsSource: PaletteSource = {
  id: 'apps',
  kinds: ['app'],
  getItems(): PaletteItem[] {
    const { isAppEnabled } = useSettingsStore.getState()
    return APP_REGISTRY.filter(
      (app) => !INSTALLABLE_APP_VIEWS.has(app.mode) || isAppEnabled(app.mode),
    ).map((app) => ({
      id: `app:${app.mode}`,
      kind: 'app',
      title: app.label,
      subtitle: 'App',
      icon: app.icon,
      keywords: ['open', 'go to', 'switch', 'app', app.mode, ...(app.keywords ?? [])],
      group: 'navigate',
      weight: 100,
      action: () => safeRun(() => useNavigationStore.getState().setActiveApp(app.mode)),
    }))
  },
}
