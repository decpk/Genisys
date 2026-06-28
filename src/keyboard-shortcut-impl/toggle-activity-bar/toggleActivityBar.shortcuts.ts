import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const TOGGLE_ACTIVITY_BAR_SHORTCUTS: ShortcutDef[] = [
  {
    // Cross-platform: `Mod+Ctrl+Alt+\` resolves to ⌃⌥⌘\ on macOS
    // (Control+Option+Command+\) and Ctrl+Alt+\ on Windows/Linux.
    id: 'global.toggleActivityBar',
    label: 'Toggle Activity Bar',
    description: 'Hide or show the activity bar',
    scope: 'global',
    defaultKeys: 'Mod+Ctrl+Alt+\\',
    category: 'View',
    allowInInput: true,
  },
]
