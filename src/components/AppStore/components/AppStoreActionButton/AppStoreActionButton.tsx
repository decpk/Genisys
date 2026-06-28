import { Check, Download, Hammer, X } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useAppStoreActions } from '../../hooks/useAppStoreActions'
import type { AppStoreActionButtonProps } from './AppStoreActionButton.types'

/**
 * The Get / Open / Remove pill rendered on every app card and at the
 * top of the detail page. Mac App Store-style:
 *  - not installed  \u2192 blue "GET" pill
 *  - installed      \u2192 ghost "OPEN" pill (+ Remove if not locked)
 *  - locked         \u2192 disabled "Built-in" pill
 */
export function AppStoreActionButton(
  props: AppStoreActionButtonProps,
): React.JSX.Element {
  const { app, size = 'sm', variant = 'pill' } = props
  const { isInstalled, install, uninstall, open, isLocked } = useAppStoreActions()
  const installed = isInstalled(app.id)
  const locked = isLocked(app.id)

  const baseClass = cn(
    'inline-flex items-center justify-center gap-1.5 font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    variant === 'pill' ? 'rounded-full' : 'rounded-md',
    size === 'sm' ? 'h-7 px-3 text-xs' : 'h-9 px-5 text-sm',
  )

  if (app.status === 'in-development') {
    return (
      <button
        type="button"
        disabled
        title="This app is still in development."
        className={cn(baseClass, 'bg-secondary/50 text-muted-foreground cursor-default')}
      >
        <Hammer size={14} /> Coming soon
      </button>
    )
  }

  if (locked && installed) {
    return (
      <button type="button" disabled className={cn(baseClass, 'bg-secondary/50 text-muted-foreground cursor-default')}>
        <Check size={14} /> Built-in
      </button>
    )
  }

  if (!installed) {
    return (
      <button
        type="button"
        onClick={() => install(app.id)}
        className={cn(baseClass, 'bg-primary/15 text-primary hover:bg-primary/25')}
      >
        <Download size={14} /> Get
      </button>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => open(app.id)}
        className={cn(baseClass, 'bg-primary/15 text-primary hover:bg-primary/25')}
      >
        Open
      </button>
      <button
        type="button"
        onClick={() => uninstall(app.id)}
        aria-label={`Remove ${app.name}`}
        className={cn(
          baseClass,
          'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground',
        )}
      >
        <X size={14} /> Remove
      </button>
    </div>
  )
}
