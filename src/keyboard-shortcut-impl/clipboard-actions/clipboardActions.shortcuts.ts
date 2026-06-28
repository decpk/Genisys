import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const CLIPBOARD_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'clipboard.focusSearch',
    label: 'Focus Search',
    description: 'Focus the clipboard search input',
    scope: 'clipboard',
    defaultKeys: 'Mod+F',
    category: 'Clipboard',
    allowInInput: true,
  },
]
