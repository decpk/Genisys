import { useCallback, useEffect, useRef } from 'react'

import { AppShell } from '@/components/AppShell'
import { RightPanel } from '@/components/RightPanel'
import { useRegisterChatSurface } from '@/keyboard-shortcut-impl'
import { useChatHistoryStore } from '@/store/chat-history-store'
import { useNavigationStore } from '@/store/navigation-store'

import { ChatMain } from './components/ChatMain'
import { ChatRightPanel } from './components/ChatRightPanel'
import { ChatSidebar } from './components/ChatSidebar'
import { useChatNewChatHandler } from './hooks/useChatNewChatHandler'

export function Chat(): React.JSX.Element {
  // Handle navigation from dashboard snippet clicks
  const pendingConversationId = useNavigationStore((s) => s.pendingConversationId)
  const consumeConversation = useNavigationStore((s) => s.consumeConversation)
  const selectConversation = useChatHistoryStore((s) => s.selectConversation)
  const conversations = useChatHistoryStore((s) => s.conversations)
  useEffect(() => {
    if (!pendingConversationId) return
    const exists = conversations.some((c) => c.id === pendingConversationId)
    if (exists) {
      selectConversation(pendingConversationId)
    }
    consumeConversation()
  }, [pendingConversationId, consumeConversation, selectConversation, conversations])

  const handleInsertSnippet = useCallback((content: string) => {
    const editor = (window as unknown as Record<string, unknown>).__chatEditor as import('@tiptap/react').Editor | undefined
    if (!editor) return
    editor.commands.insertContent(content)
    editor.commands.focus()
  }, [])

  // ── Register as a chat surface so Cmd/Ctrl+N triggers "new chat" when focused inside. ──
  const rootRef = useRef<HTMLDivElement>(null)
  const handleNewChat = useChatNewChatHandler()
  useRegisterChatSurface(rootRef, handleNewChat)

  return (
    <div ref={rootRef} className="contents">
      <AppShell
        appId="chat"
        sidebar={<ChatSidebar />}
        rightPanel={
          <RightPanel appId="chat" defaultOpen>
            <ChatRightPanel onInsertSnippet={handleInsertSnippet} />
          </RightPanel>
        }
      >
        <ChatMain />
      </AppShell>
    </div>
  )
}
