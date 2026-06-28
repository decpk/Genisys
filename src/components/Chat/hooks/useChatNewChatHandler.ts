import { useCallback } from 'react'

import { useChatHistoryStore } from '@/store/chat-history-store'

import { focusChatEditor } from '../utils/focusChatEditor'

/**
 * Returns the canonical "new chat" handler for the Main Chat surface.
 *
 * Behavior (matches the existing "+" button in `ChatSidebar`):
 *  1. If the currently-active conversation has zero messages → just focus the editor.
 *  2. Otherwise, if some other empty conversation already exists → select it and focus.
 *  3. Otherwise → create a new conversation and focus.
 *
 * Used by both the "+" button in `ChatSidebar` and the Cmd/Ctrl+N keyboard
 * shortcut wired up in `Chat.tsx`.
 */
export function useChatNewChatHandler(): () => void {
  const conversations = useChatHistoryStore((s) => s.conversations)
  const activeId = useChatHistoryStore((s) => s.activeConversationId)
  const selectConversation = useChatHistoryStore((s) => s.selectConversation)
  const createConversation = useChatHistoryStore((s) => s.createConversation)

  return useCallback(() => {
    const active = activeId ? conversations.find((c) => c.id === activeId) : null
    if (active && active.messageCount === 0) {
      focusChatEditor()
      return
    }

    const emptyConv = conversations.find((c) => c.messageCount === 0)
    if (emptyConv) {
      selectConversation(emptyConv.id)
      requestAnimationFrame(focusChatEditor)
      return
    }

    createConversation()
    requestAnimationFrame(focusChatEditor)
  }, [activeId, conversations, selectConversation, createConversation])
}
