import { cn } from '@/lib/utils'

import type { AppStatus } from '../../AppStore.types'

const STATUS_META: Record<AppStatus, { label: string; className: string }> = {
  archived: {
    label: 'Archived',
    className: 'bg-secondary text-muted-foreground',
  },
  'in-development': {
    label: 'In development',
    className: 'bg-amber-500/15 text-amber-600',
  },
}

export interface AppStoreStatusBadgeProps {
  status: AppStatus
  className?: string
}

/**
 * Small lifecycle-status pill ("Archived" / "In development") rendered
 * next to an app's name on cards and the detail page.
 */
export function AppStoreStatusBadge(
  props: AppStoreStatusBadgeProps,
): React.JSX.Element {
  const { status, className } = props
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  )
}
