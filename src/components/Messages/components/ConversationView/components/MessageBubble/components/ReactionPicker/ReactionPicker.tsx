import { SmilePlus } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'

import { QUICK_REACTION_EMOJIS } from './ReactionPicker.constants'
import { reactionPickerStyles as s } from './ReactionPicker.styles'
import type { ReactionPickerProps } from './ReactionPicker.types'
import { useReactionPickerData } from './useReactionPickerData'

export function ReactionPicker(props: ReactionPickerProps): React.JSX.Element {
  const { onPick, isOutgoing } = props
  const { open, setOpen, handlePick } = useReactionPickerData(onPick)

  const side = isOutgoing ? 'left' : 'right'

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button type="button" className={s.trigger} aria-label="Add reaction">
          <SmilePlus className={s.triggerIcon} />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content side={side} align="center" sideOffset={6} className={s.content}>
          {QUICK_REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={s.emojiButton}
              aria-label={`React ${emoji}`}
              onClick={() => handlePick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
