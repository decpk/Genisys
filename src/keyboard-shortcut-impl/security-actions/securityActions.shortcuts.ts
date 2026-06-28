import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const SECURITY_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'security.lock',
    label: 'Lock App',
    description: 'Immediately lock the app behind the security lock screen',
    scope: 'global',
    defaultKeys: 'Mod+Ctrl+L',
    category: 'Security',
    allowInInput: true,
  },
]
