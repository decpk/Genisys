import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

/**
 * Terminal app shortcuts (scope `terminal`). Tab/split/pane management is
 * handled here via the global dispatcher (fully customizable + command-palette
 * discoverable). Surface-level actions — copy/paste, clear, and Ctrl+C SIGINT —
 * are handled inside the xterm key handler so SIGINT is never intercepted.
 *
 * `allowInInput: true` is required because xterm focuses a hidden textarea.
 */
export const TERMINAL_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'terminal.newTab',
    label: 'New Terminal Tab',
    description: 'Open a new terminal in the active pane',
    scope: 'terminal',
    defaultKeys: 'Mod+T',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.closeTab',
    label: 'Close Terminal Tab',
    description: 'Close the active terminal tab',
    scope: 'terminal',
    defaultKeys: 'Mod+W',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.closeAllTabs',
    label: 'Close All Terminal Tabs',
    description: 'Close every terminal across all panes, keeping pinned tabs',
    scope: 'terminal',
    defaultKeys: 'Mod+K Mod+W',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.pinTab',
    label: 'Pin / Unpin Terminal Tab',
    description: 'Toggle pinning on the active tab so Close All keeps it open',
    scope: 'terminal',
    defaultKeys: 'Mod+K Mod+P',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.nextTab',
    label: 'Next Terminal Tab',
    description: 'Focus the next tab in the active pane',
    scope: 'terminal',
    defaultKeys: 'Ctrl+Tab',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.prevTab',
    label: 'Previous Terminal Tab',
    description: 'Focus the previous tab in the active pane',
    scope: 'terminal',
    defaultKeys: 'Ctrl+Shift+Tab',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.splitRight',
    label: 'Split Terminal Right',
    description: 'Split the active pane into a side-by-side terminal',
    scope: 'terminal',
    defaultKeys: 'Mod+\\',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.splitDown',
    label: 'Split Terminal Down',
    description: 'Split the active pane into a stacked terminal',
    scope: 'terminal',
    defaultKeys: 'Mod+Shift+\\',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.focusNextPane',
    label: 'Focus Next Pane',
    description: 'Move focus to the next terminal pane',
    scope: 'terminal',
    defaultKeys: 'Mod+Alt+]',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.focusPrevPane',
    label: 'Focus Previous Pane',
    description: 'Move focus to the previous terminal pane',
    scope: 'terminal',
    defaultKeys: 'Mod+Alt+[',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.closePane',
    label: 'Close Terminal Pane',
    description: 'Close the active terminal pane and all its tabs',
    scope: 'terminal',
    defaultKeys: 'Mod+Shift+W',
    category: 'Terminal',
    allowInInput: true,
  },
  {
    id: 'terminal.insertPrompt',
    label: 'Insert Prompt…',
    description: 'Open the prompt picker to insert a saved prompt into the active terminal',
    scope: 'terminal',
    defaultKeys: 'Mod+L Mod+E',
    category: 'Terminal',
    allowInInput: true,
  },
]
