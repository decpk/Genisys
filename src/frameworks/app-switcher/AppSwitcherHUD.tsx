import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

import type { AppView } from '@/components/ActivityBar'
import { findAppItem } from '@/components/ActivityBar'
import { cn } from '@/lib/utils'

import { useAppSwitcherStore } from './app-switcher-store'

/** Apps that cannot be closed from the HUD (always-on fallback). */
const NON_CLOSABLE_APPS: ReadonlySet<AppView> = new Set<AppView>(['dashboard'])

interface AppSwitcherHUDProps {
  /**
   * Callback invoked when the user clicks a tile (commit immediately).
   * The HUD also commits on Control-release via {@link useAppSwitcherHotkeys}.
   */
  onCommit: (app: AppView) => void
  /**
   * Callback invoked when the user clicks the red close button on a tile.
   * Should deactivate (unmount) the given app.
   */
  onCloseApp?: (app: AppView) => void
}

/**
 * Mac-style HUD that appears centered on screen while the user is cycling
 * apps via the keyboard. Renders nothing when closed, so it's safe to
 * mount once at the app shell level.
 *
 * UX:
 *   - Horizontal row of icon tiles, highlight on the selected app.
 *   - Label of the highlighted app below the row.
 *   - Click a tile to commit. Click the scrim to cancel.
 *   - Hover moves the highlight without committing.
 */
export function AppSwitcherHUD({ onCommit, onCloseApp }: AppSwitcherHUDProps): React.ReactPortal | null {
  const open = useAppSwitcherStore((s) => s.open)
  const candidates = useAppSwitcherStore((s) => s.candidates)
  const highlightedIndex = useAppSwitcherStore((s) => s.highlightedIndex)
  const setHighlightedIndex = useAppSwitcherStore((s) => s.setHighlightedIndex)
  const close = useAppSwitcherStore((s) => s.close)
  const commit = useAppSwitcherStore((s) => s.commit)
  const removeCandidate = useAppSwitcherStore((s) => s.removeCandidate)

  if (!open || candidates.length === 0) return null

  const highlightedApp = candidates[highlightedIndex]
  const highlightedItem = highlightedApp ? findAppItem(highlightedApp) : undefined
  const highlightedLabel = highlightedItem?.tooltip ?? highlightedItem?.label ?? highlightedApp ?? ''

  const closableApps = onCloseApp ? candidates.filter((mode) => !NON_CLOSABLE_APPS.has(mode)) : []
  const closeAll = (): void => {
    for (const mode of closableApps) {
      onCloseApp?.(mode)
      removeCandidate(mode)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="false"
      aria-label="App switcher"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-background/40 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        // Click on the scrim cancels (not on the panel itself).
        if (event.target === event.currentTarget) close()
      }}
    >
      <div
        className={cn(
          'pointer-events-auto rounded-[2rem] border border-border/40 bg-card/95 shadow-2xl',
          'px-8 py-7 backdrop-blur-md',
          'min-w-[480px] max-w-[92vw]',
        )}
      >
        <div className="flex items-center justify-center gap-3">
          {candidates.map((mode, index) => {
            const item = findAppItem(mode)
            if (!item) return null
            const Icon = item.icon
            const isHighlighted = index === highlightedIndex
            const isClosable = Boolean(onCloseApp) && !NON_CLOSABLE_APPS.has(mode)
            return (
              <div key={mode} className="group relative shrink-0">
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit(onCommit)}
                  className={cn(
                    'relative flex h-20 w-20 items-center justify-center rounded-2xl',
                    'border transition-all duration-100',
                    'cursor-pointer',
                    isHighlighted
                      ? 'border-primary/60 bg-primary/15 text-primary shadow-sm scale-[1.04]'
                      : 'border-border/30 bg-background/60 text-muted-foreground/80 hover:bg-background/80',
                  )}
                  aria-label={item.label}
                  aria-current={isHighlighted ? 'true' : undefined}
                >
                  <Icon size={36} strokeWidth={isHighlighted ? 2.25 : 1.75} />
                </button>
                {isClosable && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation()
                      onCloseApp?.(mode)
                      removeCandidate(mode)
                    }}
                    className={cn(
                      'absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full',
                      'bg-red-500 text-white shadow-md ring-2 ring-card',
                      'opacity-0 transition-opacity duration-100 group-hover:opacity-100',
                      'hover:bg-red-600 focus-visible:opacity-100 focus-visible:outline-none',
                    )}
                    aria-label={`Close ${item.label}`}
                    title={`Close ${item.label}`}
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-5 text-center text-base font-medium text-foreground">
          {highlightedLabel}
        </div>
        {closableApps.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation()
                closeAll()
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                'border border-red-500/30 bg-red-500/10 text-red-500',
                'transition-colors duration-100',
                'hover:border-red-500/50 hover:bg-red-500/15 focus-visible:outline-none',
              )}
              aria-label="Close all apps"
              title="Close all apps"
            >
              <X size={13} strokeWidth={2.5} />
              Close all
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
