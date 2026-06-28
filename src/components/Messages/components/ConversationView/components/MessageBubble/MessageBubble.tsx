import { Timer } from 'lucide-react'

import { cn } from '@/lib/utils'

import { ImageLightbox } from '../ImageLightbox'
import { MessageReactions } from './components/MessageReactions'
import { ReactionPicker } from './components/ReactionPicker'
import { messageBubbleStyles as s } from './MessageBubble.styles'
import type { MessageBubbleProps } from './MessageBubble.types'
import { useMessageBubbleData } from './useMessageBubbleData'

export function MessageBubble(props: MessageBubbleProps): React.JSX.Element {
  const { message, onImageLoad } = props
  const { isOutgoing, isImage, time, reactions, hasExpiry, onToggleReaction } =
    useMessageBubbleData(message)

  let content: React.JSX.Element
  if (isImage && message.imageObjectUrl) {
    content = (
      <ImageLightbox
        src={message.imageObjectUrl}
        fileName={message.fileName}
        alt={message.fileName ?? 'Shared image'}
        onLoad={onImageLoad}
      />
    )
  } else {
    content = <p className={s.text}>{message.text}</p>
  }

  let expiryNode: React.JSX.Element | null = null
  if (hasExpiry) {
    expiryNode = <Timer className={s.expiryIcon} aria-label="Disappearing message" />
  }

  return (
    <div className={cn(s.row, isOutgoing && s.rowOut, !isOutgoing && s.rowIn)}>
      <div className={cn(s.stack, isOutgoing && s.stackOut, !isOutgoing && s.stackIn)}>
        <div className={cn(s.bubbleWrap, isOutgoing && s.bubbleWrapOut)}>
          <div
            className={cn(
              s.bubble,
              isOutgoing && s.bubbleOut,
              !isOutgoing && s.bubbleIn,
              isImage && s.bubbleImage
            )}
          >
            {content}
            <span
              className={cn(
                s.meta,
                isOutgoing && s.metaOut,
                !isOutgoing && s.metaIn,
                isImage && s.metaImage
              )}
            >
              {expiryNode}
              {time}
            </span>
          </div>
          <ReactionPicker onPick={onToggleReaction} isOutgoing={isOutgoing} />
        </div>
        <MessageReactions
          reactions={reactions}
          onToggle={onToggleReaction}
          isOutgoing={isOutgoing}
        />
      </div>
    </div>
  )
}
