import { memo } from 'react'

import { EmptyState } from '@/components/ui/empty-state'

import { useMostUsedTableData } from './useMostUsedTableData'
import type { MostUsedTableProps } from './MostUsedTable.types'

const HEAD_CLASS =
  'px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground'
const NUM_HEAD_CLASS = `${HEAD_CLASS} text-right`
const CELL_CLASS = 'px-3 py-2 text-sm text-foreground'
const NUM_CELL_CLASS = `${CELL_CLASS} text-right tabular-nums`

export const MostUsedTable = memo(function MostUsedTable(
  props: MostUsedTableProps,
): React.JSX.Element {
  const rows = useMostUsedTableData(props)

  if (rows.length === 0) {
    return <EmptyState message="No app activity yet." className="py-12" />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <table className="w-full border-collapse">
        <thead className="bg-muted/40">
          <tr>
            <th className={HEAD_CLASS}>App</th>
            <th className={NUM_HEAD_CLASS}>Active</th>
            <th className={NUM_HEAD_CLASS}>Open</th>
            <th className={NUM_HEAD_CLASS}>Sessions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.appView} className="border-t border-border/40">
              <td className={`${CELL_CLASS} font-medium`}>{row.label}</td>
              <td className={NUM_CELL_CLASS}>{row.foreground}</td>
              <td className={NUM_CELL_CLASS}>{row.open}</td>
              <td className={NUM_CELL_CLASS}>{row.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
