import { memo } from 'react'

import type { AIInspectorStats as StatsType } from '../AIInspector.types'

interface AIInspectorStatsProps {
  stats: StatsType
}

export const AIInspectorStats = memo(function AIInspectorStats({ stats }: AIInspectorStatsProps): React.JSX.Element {
  return (
    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs">
      <StatBadge
        label="Total"
        value={stats.total}
        className="text-foreground"
      />
      <StatBadge
        label="Pending"
        value={stats.pending}
        className="text-yellow-500"
      />
      <StatBadge
        label="Streaming"
        value={stats.streaming}
        className="text-blue-500"
      />
      <StatBadge
        label="Success"
        value={stats.success}
        className="text-green-500"
      />
      <StatBadge label="Error" value={stats.error} className="text-red-500" />
      <span className="text-muted-foreground">
        Avg: <span className="tabular-nums">{stats.avgDuration}ms</span>
      </span>
    </div>
  );
})

function StatBadge({ label, value, className }: { label: string; value: number; className: string }): React.JSX.Element {
  return (
    <span className={className}>
      {label}: <span className="tabular-nums font-semibold">{value}</span>
    </span>
  );
}
