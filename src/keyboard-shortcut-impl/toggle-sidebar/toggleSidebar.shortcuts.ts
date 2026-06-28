import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const TOGGLE_SIDEBAR_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'global.toggleSidebar',
    label: 'Toggle Sidebar',
    description: 'Collapse or expand the left sidebar panel',
    scope: 'global',
    defaultKeys: 'Mod+B',
    category: 'View',
  },
]
