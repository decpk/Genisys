import { cn } from '@/lib/utils'
import { useSmartCollectionsSidebarData } from './useSmartCollectionsSidebarData'
import type { SmartCollectionsSidebarProps } from './SmartCollectionsSidebar.types'
import type { SmartCollectionKey } from '../../utils/smart-collections'

export function SmartCollectionsSidebar(props: SmartCollectionsSidebarProps): React.JSX.Element | null {
  const { activeFilter, onFilterChange, className } = props
  const { collections, getConfig, getIcon } = useSmartCollectionsSidebarData()

  if (collections.length === 0) return null

  return (
    <div className={cn('px-2 py-1', className)}>
      <div className="flex items-center px-2.5 mb-1">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Smart Collections
        </span>
      </div>
      <div className="space-y-0.5">
        {collections.map(({ key, count }) => {
          const config = getConfig(key)
          const Icon = getIcon(key)
          const filterKey = `smart:${key}` as `smart:${SmartCollectionKey}`
          const isActive = activeFilter === filterKey

          return (
            <button
              key={key}
              onClick={() => onFilterChange(filterKey)}
              className={cn(
                'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 border border-primary/30 text-primary font-medium'
                  : 'border border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon size={15} />
              <span className="flex-1 text-left truncate">{config.label}</span>
              <span className="text-xs tabular-nums opacity-60">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
