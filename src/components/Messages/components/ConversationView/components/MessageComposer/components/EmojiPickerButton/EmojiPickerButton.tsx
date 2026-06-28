import { lazy, Suspense } from 'react'
import { Smile } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'

import { AppInlineLoader } from '@/components/AppLoader'

import { emojiPickerButtonStyles as s } from './EmojiPickerButton.styles'
import type { EmojiPickerButtonProps } from './EmojiPickerButton.types'
import { useEmojiPickerButtonData } from './useEmojiPickerButtonData'

// Lazy-loaded so the (heavy) emoji dataset is only fetched when the user
// actually opens the picker, keeping the Messages bundle lean.
const EmojiPicker = lazy(() => import('emoji-picker-react'))

export function EmojiPickerButton(props: EmojiPickerButtonProps): React.JSX.Element {
  const { onSelect, disabled } = props
  const { open, setOpen, handleEmojiClick } = useEmojiPickerButtonData(onSelect)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button type="button" className={s.trigger} disabled={disabled} aria-label="Insert emoji">
          <Smile className="h-4 w-4" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content side="top" align="start" sideOffset={8} className={s.content}>
          <Suspense fallback={<div className={s.loading}><AppInlineLoader /></div>}>
            <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis width={320} height={360} />
          </Suspense>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
