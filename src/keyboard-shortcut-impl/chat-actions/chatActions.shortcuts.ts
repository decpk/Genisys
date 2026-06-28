import type { ShortcutDef } from '@/frameworks/keyboard-shortcut/KeyboardShortcut.types'

export const CHAT_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: 'chat.newChat',
    label: 'New Chat',
    description:
      'Create a new AI chat (or reuse an existing empty one) in the focused chat surface and focus its input.',
    scope: 'global',
    defaultKeys: 'Mod+N',
    category: 'Chat',
    allowInInput: true,
  },
]
