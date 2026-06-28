import { TypingIndicator } from '../TypingIndicator'
import { MessageBubble } from '../MessageBubble'
import { cn } from '@/lib/utils'
import { getContentWidthClasses } from '@/lib/content-width'
import { useSettingsStore } from '@/store/settings-store'
import { messageListStyles as s } from './MessageList.styles'
import type { MessageListProps } from './MessageList.types'
import { useMessageListData } from './useMessageListData'

export function MessageList(props: MessageListProps): React.JSX.Element {
  const { messages, isPeerTyping } = props
  const { rootRef, bottomRef, handleScroll, handleMediaLoad } =
    useMessageListData(messages.length, isPeerTyping)
  const contentWidth = useSettingsStore((state) => state.messagesContentWidth)
  const widthClasses = getContentWidthClasses(contentWidth)

  let typingNode: React.JSX.Element | null = null
  if (isPeerTyping) {
    typingNode = (
      <div className={s.typingRow}>
        <TypingIndicator />
      </div>
    )
  }

  return (
    <div className={s.root} ref={rootRef} onScroll={handleScroll}>
      <div className={cn(s.inner, widthClasses.maxWidth, widthClasses.paddingX)}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onImageLoad={handleMediaLoad}
          />
        ))}
        {typingNode}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
