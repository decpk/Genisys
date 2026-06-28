import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'

import { handleNewChatShortcut } from './utils/handleNewChatShortcut'

export function useChatActionsAction(): void {
  useBindShortcutActions({
    'chat.newChat': handleNewChatShortcut,
  })
}
