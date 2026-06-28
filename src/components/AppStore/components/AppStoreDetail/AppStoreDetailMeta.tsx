import { Lock, Package, Tag } from 'lucide-react'

import type { AppStatus } from '../../AppStore.types'

export type AppStoreDetailMetaDirection = 'horizontal' | 'vertical'

export interface AppStoreDetailMetaProps {
  version: string
  categoryLabel: string
  locked: boolean
  /** Lifecycle status; overrides the locked/optional status label. */
  status?: AppStatus
  /**
   * Layout direction for the meta cells.
   * - `horizontal` (default): 3-column strip, ideal under the hero.
   * - `vertical`: stacked cells, ideal for a right-side info panel.
   */
  direction?: AppStoreDetailMetaDirection
}

/**
 * Meta panel showing version, category, and whether the app is
 * "built-in" (locked / cannot be removed). Renders as a 3-column strip
 * by default, or a stacked column when `direction="vertical"`.
 */
export function AppStoreDetailMeta(
  props: AppStoreDetailMetaProps,
): React.JSX.Element {
  const { version, categoryLabel, locked, status, direction = 'horizontal' } = props
  const isVertical = direction === 'vertical'
  const statusValue =
    status === 'archived'
      ? 'Archived'
      : status === 'in-development'
        ? 'In development'
        : locked
          ? 'Built-in'
          : 'Optional'
  const wrapperClass = isVertical
    ? 'flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/30 px-4 py-4'
    : 'mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-border/40 bg-card/30 px-4 py-3'
  return (
    <div className={wrapperClass}>
      <MetaCell icon={Package} label="Version" value={version} />
      <MetaCell icon={Tag} label="Category" value={categoryLabel} />
      <MetaCell icon={Lock} label="Status" value={statusValue} />
    </div>
  )
}

interface MetaCellProps {
  icon: typeof Package
  label: string
  value: string
}

function MetaCell(props: MetaCellProps): React.JSX.Element {
  const { icon: Icon, label, value } = props
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-foreground">
          {value}
        </div>
      </div>
    </div>
  )
}
