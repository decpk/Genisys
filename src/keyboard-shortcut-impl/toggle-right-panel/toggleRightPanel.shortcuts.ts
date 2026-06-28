import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const TOGGLE_RIGHT_PANEL_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'global.toggleRightPanel',
    label: 'Toggle Right Panel',
    description: 'Collapse or expand the right side panel',
    scope: 'global',
    defaultKeys: 'Mod+J',
    category: 'View',
  },
]
