import { cn } from '@/lib/utils'
import { useAppDragStore } from '@/store/app-drag-store'

import type { AppDetachPreviewProps } from './AppDetachPreview.types'

/**
 * Drag ghost rendered inside the ActivityBar's `<DragOverlay>` while an app
 * icon is being dragged. `@dnd-kit` positions the overlay under the cursor for
 * us, so this is purely presentational (no fixed positioning / portal).
 *
 * While the cursor is still over the bar it reads as a normal "picked up" icon
 * (a reorder is in progress); once the cursor leaves the bar it shows the
 * "release to open in a new window" hint — matching the Chrome / VSCode tab
 * tear-off feel.
 */
export function AppDetachPreview(props: AppDetachPreviewProps): React.JSX.Element {
  const { icon: Icon, showDropHint } = props
  const pointerZone = useAppDragStore((s) => s.pointerZone)
  const isDisable = pointerZone === 'disable'
  const showHint = isDisable || showDropHint

  return (
    <div aria-hidden className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'flex size-9 scale-110 cursor-grabbing items-center justify-center rounded-lg border shadow-2xl backdrop-blur-md',
          isDisable
            ? 'border-destructive/50 bg-destructive/15 text-destructive'
            : 'border-primary/50 bg-primary/15 text-primary',
        )}
      >
        <Icon size={20} strokeWidth={2} />
      </div>
      {showHint && (
        <div
          className={cn(
            'whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium shadow-lg backdrop-blur-md',
            isDisable
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'border-border/60 bg-popover/95 text-popover-foreground',
          )}
        >
          {isDisable ? 'Release to disable' : 'Release to open in a new window'}
        </div>
      )}
    </div>
  )
}
