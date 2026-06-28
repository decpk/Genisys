import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const MOCKSERVER_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'mockserver.newEndpoint',
    label: 'New Endpoint',
    description: 'Open the dialog to create a new endpoint for the selected server.',
    scope: 'mockserver',
    defaultKeys: 'Mod+N',
    category: 'Mock Server',
    allowInInput: true,
  },
  {
    id: 'mockserver.toggleTerminal',
    label: 'Toggle Terminal Panel',
    description:
      'Show / hide the integrated Terminal docked at the bottom of the Mock Server workspace.',
    scope: 'mockserver',
    defaultKeys: 'Ctrl+`',
    category: 'Mock Server',
    allowInInput: true,
  },
  {
    id: 'mockserver.closeTab',
    label: 'Close Active Endpoint Tab',
    description:
      'Close the currently open endpoint tab. If the selected server is running, it is stopped as well.',
    scope: 'mockserver',
    defaultKeys: 'Mod+W',
    category: 'Mock Server',
    allowInInput: true,
  },
]
