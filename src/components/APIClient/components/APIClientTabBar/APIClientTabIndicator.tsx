import { useCallback } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { APIClientTabIndicatorProps } from './APIClientTabIndicator.types'

export function APIClientTabIndicator(props: APIClientTabIndicatorProps) {
  const { isActive, isDirty, isSending, onClose } = props

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onClose()
    },
    [onClose],
  )

  if (isSending) {
    return (
      <span className="-ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
      </span>
    )
  }

  const xVisibilityCls = isActive
    ? 'opacity-100'
    : 'opacity-0 group-hover/tab:opacity-100'

  let xCls: string
  if (isDirty) {
    xCls = cn(
      'h-3 w-3 text-muted-foreground transition-opacity hover:text-foreground',
      'hidden group-hover/tab:block',
    )
  } else {
    xCls = cn(
      'h-3 w-3 text-muted-foreground transition-opacity hover:text-foreground',
      xVisibilityCls,
    )
  }

  return (
    <span
      role="button"
      onClick={handleClose}
      className="-ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors hover:bg-foreground/10"
    >
      {isDirty && (
        <span className="h-2 w-2 rounded-full bg-foreground/60 group-hover/tab:hidden" />
      )}
      <X className={xCls} />
    </span>
  )
}
