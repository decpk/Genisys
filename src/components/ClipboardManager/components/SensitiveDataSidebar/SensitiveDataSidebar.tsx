import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSensitiveDataSidebarData } from './useSensitiveDataSidebarData'
import type { SensitiveDataSidebarProps } from './SensitiveDataSidebar.types'

export function SensitiveDataSidebar(props: SensitiveDataSidebarProps): React.JSX.Element | null {
  const { activeFilter, onFilterChange, className } = props
  const { sensitiveCount } = useSensitiveDataSidebarData()

  if (sensitiveCount === 0) return null

  const isActive = activeFilter === 'sensitive'

  return (
    <div className={cn('px-2 py-1', className)}>
      <div className="flex items-center px-2.5 mb-1">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Security
        </span>
      </div>
      <div className="space-y-0.5">
        <button
          onClick={() => onFilterChange('sensitive')}
          className={cn(
            'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm transition-colors',
            isActive
              ? 'bg-red-500/15 text-red-400 font-medium border border-red-500/20'
              : 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
          )}
        >
          <ShieldAlert size={15} />
          <span className="flex-1 text-left">Sensitive Data</span>
          <span className="text-xs tabular-nums opacity-60">{sensitiveCount}</span>
        </button>
      </div>
    </div>
  )
}
