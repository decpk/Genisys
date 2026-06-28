import { memo, useCallback } from 'react'

import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { useChatHistoryStore } from '@/store/chat-history-store'
import type { CitationClickInfo } from '@/components/ui/markdown-renderer'

interface ChatAnswerProps {
  content: string
  isStreaming?: boolean
}

export const ChatAnswer = memo(function ChatAnswer({
  content,
  isStreaming = false,
}: ChatAnswerProps): React.JSX.Element {
  const openSourcePreview = useChatHistoryStore((s) => s.openSourcePreview)

  const handleCitationClick = useCallback(
    (info: CitationClickInfo) => openSourcePreview(info),
    [openSourcePreview],
  )

  return (
    <MarkdownRenderer
      content={content}
      enableCitations
      onCitationClick={handleCitationClick}
      isStreaming={isStreaming}
    />
  )
})
