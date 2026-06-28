import { memo } from 'react'
import { ArrowUpRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/store/navigation-store'
import type { AppView } from '@/components/ActivityBar'

export interface TileHeadingProps {
  /** Leading icon shown before the title. */
  icon: LucideIcon
  /** Tile title text. */
  title: string
  /** Optional trailing count / meta shown after the title. */
  count?: React.ReactNode
  /**
   * When provided, the title becomes a link that navigates to this app and
   * an arrow indicator is shown to signal it is clickable.
   */
  appId?: AppView
  /** Accessible label / tooltip for the link (defaults to `Open {title}`). */
  appLabel?: string
  /** Extra classes for the header wrapper. */
  className?: string
}

/**
 * Shared dashboard tile header. When `appId` is set, the title renders as a
 * link (with an arrow affordance) that navigates to the originating app.
 */
export const TileHeading = memo(function TileHeading({
  icon: Icon,
  title,
  count,
  appId,
  appLabel,
  className,
}: TileHeadingProps): React.JSX.Element {
  const wrapperClass = cn(
    'flex items-center gap-2 px-4 py-3 border-b border-border/40',
    className,
  )

  if (!appId) {
    return (
      <div className={wrapperClass}>
        <Icon size={16} className="text-primary shrink-0" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {count != null && (
          <span className="text-xs text-muted-foreground">{count}</span>
        )}
      </div>
    )
  }

  const handleOpen = (): void => {
    useNavigationStore.getState().setActiveApp(appId)
  }

  return (
    <div className={wrapperClass}>
      <Icon size={16} className="text-primary shrink-0" />
      <button
        type="button"
        onClick={handleOpen}
        title={appLabel ?? `Open ${title}`}
        className="group/heading inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        <span>{title}</span>
        <ArrowUpRight
          size={13}
          className="opacity-60 transition-transform duration-150 group-hover/heading:translate-x-0.5 group-hover/heading:-translate-y-0.5"
        />
      </button>
      {count != null && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
    </div>
  )
})
