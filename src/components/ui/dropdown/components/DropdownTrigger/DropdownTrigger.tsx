import { cloneElement, isValidElement } from 'react'

import { IconButton } from '@/components/ui/icon-button'

import type { DropdownTriggerProps } from '../../Dropdown.types'

export function DropdownTrigger({
  trigger,
  triggerProps,
  open,
  onClick,
  fill = false,
}: DropdownTriggerProps): React.JSX.Element {
  if (triggerProps) {
    const tooltip = open ? undefined : triggerProps.tooltip

    return (
      <IconButton {...triggerProps} tooltip={tooltip} onClick={onClick}>
        {trigger}
      </IconButton>
    )
  }

  // When the tooltip lives on the trigger JSX itself (e.g. an `IconButton`
  // with a `tooltip` prop), suppress it while the menu is open by injecting
  // `tooltipDisabled`. Harmless for triggers that don't read the prop.
  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<{ tooltipDisabled?: boolean }>, {
        tooltipDisabled: open,
      })
    : trigger

  return (
    <span
      onClick={onClick}
      className={
        fill
          ? 'flex w-full min-w-0 max-w-full'
          : 'inline-flex max-w-full min-w-0'
      }
    >
      {triggerNode}
    </span>
  )
}
