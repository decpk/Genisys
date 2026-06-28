import { computeGroupTotalMinutes } from '../../utils/computeGroupTotalMinutes'
import { formatSessionDuration } from '../../utils/formatSessionDuration'
import { HistorySessionRow } from '../HistorySessionRow'

import type { HistorySessionGroupProps } from './HistorySessionGroup.types'

export function HistorySessionGroup(
  props: HistorySessionGroupProps,
): React.JSX.Element {
  const { group, onDelete } = props
  const totalMin = computeGroupTotalMinutes(group.items)

  return (
    <section className="px-3 pt-3">
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {group.label}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="tabular-nums">{group.items.length}</span>
          <span className="opacity-50">·</span>
          <span className="tabular-nums">{formatSessionDuration(totalMin * 60)}</span>
        </div>
      </div>
      <div className="rounded-xl border border-border/50 bg-card p-1.5 flex flex-col">
        {group.items.map((s) => (
          <HistorySessionRow key={s.id} session={s} onDelete={onDelete} />
        ))}
      </div>
    </section>
  )
}
