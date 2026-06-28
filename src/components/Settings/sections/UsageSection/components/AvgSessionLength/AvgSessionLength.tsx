import { memo } from 'react'

import { EmptyState } from '@/components/ui/empty-state'

import { useAvgSessionLengthData } from './useAvgSessionLengthData'
import type { AvgSessionLengthProps } from './AvgSessionLength.types'

export const AvgSessionLength = memo(function AvgSessionLength(
  props: AvgSessionLengthProps,
): React.JSX.Element {
  const rows = useAvgSessionLengthData(props)

  if (rows.length === 0) {
    return <EmptyState message="No sessions recorded yet." className="py-12" />
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => {
        const barWidth = `${Math.max(4, Math.round(row.ratio * 100))}%`
        return (
          <div key={row.appView} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{row.label}</span>
              <span className="tabular-nums text-muted-foreground">{row.avg}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div className="h-full rounded-full bg-primary" style={{ width: barWidth }} />
            </div>
          </div>
        )
      })}
    </div>
  )
})
