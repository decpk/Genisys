import { Check, Timer, TimerOff } from 'lucide-react'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import { EPHEMERAL_TTL_OPTIONS } from './EphemeralTimerPicker.constants'
import { ephemeralTimerPickerStyles as s } from './EphemeralTimerPicker.styles'
import type { EphemeralTimerPickerProps } from './EphemeralTimerPicker.types'
import { useEphemeralTimerPickerData } from './useEphemeralTimerPickerData'

export function EphemeralTimerPicker(props: EphemeralTimerPickerProps): React.JSX.Element {
  const { peerId } = props
  const { activeTtl, isActive, selectTtl } = useEphemeralTimerPickerData(peerId)

  let triggerIcon = <Timer className={s.icon} />
  if (!isActive) triggerIcon = <TimerOff className={s.icon} />

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(s.trigger, isActive && s.triggerActive)}
          aria-label="Disappearing messages"
        >
          {triggerIcon}
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content align="end" sideOffset={6} className={s.content}>
          <div className={s.label}>Disappearing messages</div>
          {EPHEMERAL_TTL_OPTIONS.map((option) => {
            const selected = option.ms === activeTtl
            let checkNode: React.JSX.Element | null = null
            if (selected) checkNode = <Check className={s.check} />
            return (
              <DropdownMenuPrimitive.Item
                key={option.ms}
                className={cn(s.item, selected && s.itemActive)}
                onSelect={() => selectTtl(option.ms)}
              >
                <span>{option.label}</span>
                {checkNode}
              </DropdownMenuPrimitive.Item>
            )
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
