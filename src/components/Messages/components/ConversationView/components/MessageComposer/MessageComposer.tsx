import { ImageUp, Lock, SendHorizonal, Timer, TimerOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { getContentWidthClasses } from '@/lib/content-width'
import { useSettingsStore } from '@/store/settings-store'
import { EmojiPickerButton } from './components/EmojiPickerButton'
import { messageComposerStyles as s } from './MessageComposer.styles'
import type { MessageComposerProps } from './MessageComposer.types'
import { useMessageComposerData } from './useMessageComposerData'

export function MessageComposer(props: MessageComposerProps): React.JSX.Element {
  const { peerId, isConnected } = props
  const {
    text,
    isSending,
    canSend,
    placeholder,
    ephemeralActive,
    textareaRef,
    fileInputRef,
    handleChange,
    handleKeyDown,
    handleSend,
    handleAttachClick,
    handleFileChange,
    onToggleEphemeral,
    insertEmoji,
  } = useMessageComposerData(peerId, isConnected)

  const contentWidth = useSettingsStore((state) => state.messagesContentWidth)
  const widthClasses = getContentWidthClasses(contentWidth)

  return (
    <div className={s.root}>
      <div className={cn(s.bar, widthClasses.maxWidth)}>
        <button
          type="button"
          className={s.iconButton}
          onClick={handleAttachClick}
          disabled={isSending || !isConnected}
          aria-label="Attach image"
        >
          <ImageUp className="h-4 w-4" />
        </button>
        <EmojiPickerButton onSelect={insertEmoji} disabled={!isConnected} />
        <textarea
          ref={textareaRef}
          className={s.textarea}
          rows={1}
          value={text}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={cn(s.iconButton, ephemeralActive && s.iconButtonActive)}
          onClick={onToggleEphemeral}
          aria-pressed={ephemeralActive}
          aria-label={
            ephemeralActive
              ? 'Disappearing messages on'
              : 'Turn on disappearing messages'
          }
        >
          {ephemeralActive ? (
            <Timer className="h-4 w-4" />
          ) : (
            <TimerOff className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          className={s.sendButton}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={s.hidden}
        onChange={handleFileChange}
      />
      <p className={cn(s.hint, widthClasses.maxWidth)}>
        <Lock className={s.hintIcon} />
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  )
}
