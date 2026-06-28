import { Dialog as DialogPrimitive } from 'radix-ui'
import { Phone, PhoneOff, Video } from 'lucide-react'

import { Identicon } from '@/components/Messages/components/Identicon'

import { incomingCallPromptStyles as s } from './IncomingCallPrompt.styles'
import { useIncomingCallPromptData } from './useIncomingCallPromptData'

function preventDismiss(event: Event): void {
  event.preventDefault()
}

export function IncomingCallPrompt(): React.JSX.Element | null {
  const { open, kind, kindLabel, peerSeed, peerName, accept, decline } = useIncomingCallPromptData()

  if (!open) return null

  let kindIcon = <Phone className={s.kindIcon} />
  if (kind === 'video') kindIcon = <Video className={s.kindIcon} />

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={s.overlay} />
        <DialogPrimitive.Content
          className={s.content}
          onEscapeKeyDown={preventDismiss}
          onInteractOutside={preventDismiss}
          onPointerDownOutside={preventDismiss}
        >
          <Identicon seed={peerSeed} size={72} />
          <DialogPrimitive.Title className={s.name}>{peerName}</DialogPrimitive.Title>
          <DialogPrimitive.Description className={s.kindRow}>
            {kindIcon}
            {kindLabel}
          </DialogPrimitive.Description>
          <div className={s.actions}>
            <button type="button" className={s.decline} onClick={decline} aria-label="Decline call">
              <PhoneOff className="h-5 w-5" />
            </button>
            <button type="button" className={s.accept} onClick={accept} aria-label="Accept call">
              <Phone className="h-5 w-5" />
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
