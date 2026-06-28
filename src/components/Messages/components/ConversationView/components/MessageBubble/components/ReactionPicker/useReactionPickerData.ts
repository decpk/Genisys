import { useCallback, useState } from 'react'

// Local open/close state for the reaction popover plus a pick handler that
// closes the popover after delegating the chosen emoji upward.
export function useReactionPickerData(onPick: (emoji: string) => void) {
  const [open, setOpen] = useState(false)

  const handlePick = useCallback(
    (emoji: string) => {
      onPick(emoji)
      setOpen(false)
    },
    [onPick]
  )

  return { open, setOpen, handlePick }
}
