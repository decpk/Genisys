import { useNavigationStore } from '@/store/navigation-store'
import { useSettingsStore } from '@/store/settings-store'
import { INSTALLABLE_APP_VIEWS } from '@/store/settings-store/AppView.constants'

import { APP_REGISTRY } from '../utils/appRegistry'
import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const switchAppCommandsSource: PaletteSource = {
  id: 'switchAppCommands',
  kinds: ['command'],
  getItems(): PaletteItem[] {
    const { isAppEnabled } = useSettingsStore.getState()
    return APP_REGISTRY.filter(
      (app) => !INSTALLABLE_APP_VIEWS.has(app.mode) || isAppEnabled(app.mode),
    ).map((app): PaletteItem => ({
      id: `command:switch:${app.mode}`,
      kind: 'command',
      title: `Switch to ${app.label}`,
      subtitle: 'Navigation',
      icon: app.icon,
      keywords: ['switch', 'go', 'goto', 'navigate', 'open', 'show', app.mode, app.label.toLowerCase(), ...(app.keywords ?? [])],
      group: 'commands',
      action: () => safeRun(() => useNavigationStore.getState().setActiveApp(app.mode)),
    }))
  },
}
