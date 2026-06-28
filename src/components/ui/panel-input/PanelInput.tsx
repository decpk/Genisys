import * as React from 'react'

import { cn } from '@/lib/utils'

export interface PanelInputProps extends React.ComponentProps<'input'> {
  /** Optional left adornment (e.g. icon). */
  leadingIcon?: React.ReactNode
  /** Optional right adornment (e.g. clear button). */
  trailingSlot?: React.ReactNode
}

/**
 * Subtle, low-contrast input designed for sidebars and right panels.
 * Uses a muted surface with a thin border that lights up only on focus.
 */
export function PanelInput(props: PanelInputProps): React.JSX.Element {
  const { className, leadingIcon, trailingSlot, type, ...rest } = props

  return (
    <div
      className={cn(
        'group flex h-8 w-full items-center gap-1.5 rounded-md border border-transparent bg-muted/30 px-2.5',
        'transition-[border-color,background-color,box-shadow] duration-150',
        'hover:bg-muted/50',
        'focus-within:border-input focus-within:bg-background focus-within:ring-1 focus-within:ring-ring/20',
        className,
      )}
    >
      {leadingIcon && (
        <span className="flex shrink-0 items-center text-muted-foreground/70 group-focus-within:text-foreground/80">
          {leadingIcon}
        </span>
      )}
      <input
        type={type ?? 'text'}
        data-slot="panel-input"
        className={cn(
          'flex-1 min-w-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/70 outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        {...rest}
      />
      {trailingSlot && <span className="shrink-0">{trailingSlot}</span>}
    </div>
  )
}
