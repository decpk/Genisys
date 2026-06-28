import { forwardRef, useImperativeHandle } from 'react'

import { cn } from '@/lib/utils'

import { useDropdown, useClickOutside, useAutoCloseDropdown } from './Dropdown.hooks'
import { DropdownTrigger } from './components/DropdownTrigger'
import { DropdownMenu } from './components/DropdownMenu'
import type { DropdownHandle, DropdownProps } from './Dropdown.types'

export const Dropdown = forwardRef<DropdownHandle, DropdownProps>(function Dropdown(
  {
    items,
    groups,
    trigger,
    triggerProps,
    align,
    side,
    openOn = 'hover',
    className,
    menuClassName,
    showCheck,
    menuWidth,
    maxHeight,
    fill = false,
    onHighlight,
    onDismiss,
    keepOpenOnSelect,
  },
  ref
): React.JSX.Element {
  const {
    open,
    anchorRect,
    triggerRef,
    menuRef,
    getTriggerRect,
    toggle,
    close,
    openAt,
    openMenu,
    scheduleClose,
    cancelClose,
  } = useDropdown()

  useImperativeHandle(
    ref,
    () => ({
      openAtPoint: (x: number, y: number) => {
        openAt(new DOMRect(x, y, 0, 0))
      },
      close,
    }),
    [openAt, close]
  )

  const dismissAndClose = () => {
    onDismiss?.()
    close()
  }

  // Close on any outside mousedown. Hover dropdowns previously had no
  // click-outside fallback and relied solely on a fragile mouseleave timer,
  // which could leave them stuck open.
  useClickOutside(menuRef, triggerRef, open, dismissAndClose)

  // Close when the trigger is no longer reachable (app switch / hidden panel)
  // or the viewport scrolls/resizes/blurs out from under the fixed menu.
  useAutoCloseDropdown(menuRef, triggerRef, open, dismissAndClose)

  const isHover = openOn === 'hover' && anchorRect === null

  const menuProps = {
    items,
    groups,
    align,
    side,
    menuClassName,
    showCheck,
    menuWidth,
    maxHeight,
    triggerRect: anchorRect ?? getTriggerRect(),
    onClose: close,
    onMouseEnter: isHover ? cancelClose : undefined,
    onMouseLeave: isHover ? scheduleClose : undefined,
    onHighlight,
    onDismiss,
    keepOpenOnSelect,
  }

  return (
    <div
      ref={triggerRef}
      className={cn(
        fill
          ? 'relative flex w-full max-w-full min-w-0'
          : 'relative inline-flex max-w-full min-w-0',
        className
      )}
      onMouseEnter={isHover ? openMenu : undefined}
      onMouseLeave={isHover ? scheduleClose : undefined}
    >
      <DropdownTrigger
        trigger={trigger}
        triggerProps={triggerProps}
        open={open}
        onClick={isHover ? undefined : toggle}
        fill={fill}
      />
      {open && <DropdownMenu ref={menuRef} {...menuProps} />}
    </div>
  )
})
