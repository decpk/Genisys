import { memo, useCallback } from 'react'

import { cn } from '@/lib/utils'
import { MicButton } from '@/components/VoiceInput'

import { chatComposerShellStyles as styles } from './ChatComposerShell.styles'
import type { ChatComposerShellProps } from './ChatComposerShell.types'
import { SendStopButton } from './SendStopButton'

/**
 * Shared input bar layout for the full Chat app and every AI Assistant
 * right-panel surface. Owns: form wrapper, mic button, send/stop button.
 * Consumers provide the editor (`children`) plus optional left/right slots
 * (mode picker, model picker, attachments, tools popover, …).
 */
export const ChatComposerShell = memo(function ChatComposerShell(
  props: ChatComposerShellProps,
): React.JSX.Element {
  const {
    children,
    leftSlot,
    rightSlot,
    isStreaming,
    onSubmit,
    onStop,
    isSubmitDisabled,
    onMicTranscript,
    onMicCommand,
    isMicDisabled,
    className,
  } = props

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (isStreaming) return
      onSubmit()
    },
    [isStreaming, onSubmit],
  )

  // Esc cancels the in-flight stream (VSCode-style). Only handle when
  // streaming, so Esc still works for closing menus/popovers otherwise.
  const handleFormKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isStreaming && onStop) {
        e.preventDefault()
        e.stopPropagation()
        onStop()
      }
    },
    [isStreaming, onStop],
  )

  let leftNode: React.ReactNode = null
  if (leftSlot) leftNode = <div className={styles.leftSlot}>{leftSlot}</div>

  let rightNode: React.ReactNode = null
  if (rightSlot) rightNode = <div className={styles.rightSlot}>{rightSlot}</div>

  let micNode: React.ReactNode = null
  if (onMicTranscript || onMicCommand) {
    micNode = (
      <MicButton
        onTranscript={onMicTranscript}
        onCommand={onMicCommand}
        commandsEnabled
        size={11}
        disabled={isMicDisabled}
      />
    )
  }

  return (
    <form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} className={cn(styles.outer, className)}>
      <div className={styles.bar}>
        {leftNode}
        <div className={styles.editorWrapper}>{children}</div>
        {rightNode}
        {micNode}
        <SendStopButton
          isStreaming={isStreaming}
          onSend={onSubmit}
          onStop={onStop}
          disabled={isSubmitDisabled}
        />
      </div>
    </form>
  )
})
