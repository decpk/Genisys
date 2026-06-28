import { memo } from 'react'
import { Send, Square } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

import { sendStopButtonStyles as styles } from './SendStopButton.styles'
import type { SendStopButtonProps } from './SendStopButton.types'

/** Send button that flips to a stop button while streaming. */
export const SendStopButton = memo(function SendStopButton(
  props: SendStopButtonProps,
): React.JSX.Element {
  const { isStreaming, onSend, onStop, disabled } = props

  if (isStreaming) {
    return (
      <Tooltip content="Stop" shortcut="Esc" side="top">
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop streaming"
          className={cn(styles.base, styles.stop)}
        >
          <Square size={14} />
        </button>
      </Tooltip>
    )
  }

  return (
    <Tooltip content="Send" side="top">
      <button
        type="submit"
        onClick={onSend}
        disabled={disabled}
        aria-label="Send message"
        className={cn(styles.base, styles.send)}
      >
        <Send size={14} />
      </button>
    </Tooltip>
  )
})
