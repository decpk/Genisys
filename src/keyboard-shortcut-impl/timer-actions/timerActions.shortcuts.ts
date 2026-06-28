import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const TIMER_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'timer.startPause',
    label: 'Start / Pause Timer',
    description: 'Toggle the primary timer between start and pause',
    scope: 'global',
    defaultKeys: 'Mod+Shift+T',
    category: 'Timer',
    allowInInput: false,
  },
  {
    id: 'timer.reset',
    label: 'Reset Timer',
    description: 'Reset the primary timer',
    scope: 'global',
    defaultKeys: 'Mod+Shift+R',
    category: 'Timer',
    allowInInput: false,
  },
  {
    id: 'timer.skip',
    label: 'Skip Phase',
    description: 'Skip the current phase of the primary timer',
    scope: 'timer',
    defaultKeys: 'Mod+Shift+K',
    category: 'Timer',
    allowInInput: false,
  },
  {
    id: 'timer.newTimer',
    label: 'New Timer',
    description: 'Open the New Timer dialog',
    scope: 'timer',
    defaultKeys: 'Mod+Shift+N',
    category: 'Timer',
    allowInInput: false,
  },
]
