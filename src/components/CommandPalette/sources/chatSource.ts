import { useChatHistoryStore } from '@/store/chat-history-store'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import { truncate } from '../utils/truncate'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const chatSource: PaletteSource = {
  id: 'chat',
  kinds: ['chat'],
  load: async () => {
    try {
      const state = useChatHistoryStore.getState() as { loadConversations?: () => Promise<void> }
      await state.loadConversations?.()
    } catch {
      /* ignore */
    }
  },
  getItems(): PaletteItem[] {
    try {
      const state = useChatHistoryStore.getState() as {
        conversations?: Array<{
          id: string
          title?: string
          firstMessage?: string
          updatedAt?: string
          messageCount?: number
        }>
      }
      const conversations = state.conversations ?? []
      return conversations.map((c): PaletteItem => ({
        id: `chat:${c.id}`,
        kind: 'chat',
        title: c.title || 'Untitled conversation',
        subtitle: truncate(c.firstMessage, 80) || 'Conversation',
        keywords: ['chat', 'conversation', 'ai', 'assistant', 'history', 'thread'],
        group: 'navigate',
        action: () =>
          safeRun(() => useNavigationStore.getState().openConversation(c.id)),
      }))
    } catch {
      return []
    }
  },
}
