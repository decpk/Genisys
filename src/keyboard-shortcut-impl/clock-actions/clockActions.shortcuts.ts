import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const CLOCK_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'clock.showFullscreen',
    label: 'Show Fullscreen Clock',
    description: 'Peek a beautiful fullscreen clock that auto-dismisses',
    scope: 'global',
    defaultKeys: 'Mod+Ctrl+Alt+T',
    category: 'Clock',
    allowInInput: true,
  },
]
