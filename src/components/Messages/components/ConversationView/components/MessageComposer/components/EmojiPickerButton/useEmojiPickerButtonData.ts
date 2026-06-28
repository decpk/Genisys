import { useCallback, useState } from 'react'
import type { EmojiClickData } from 'emoji-picker-react'

// Open/close state for the emoji popover plus an adapter that forwards the
// chosen emoji upward and closes the popover.
export function useEmojiPickerButtonData(onSelect: (emoji: string) => void) {
  const [open, setOpen] = useState(false)

  const handleEmojiClick = useCallback(
    (data: EmojiClickData) => {
      onSelect(data.emoji)
      setOpen(false)
    },
    [onSelect]
  )

  return { open, setOpen, handleEmojiClick }
}
