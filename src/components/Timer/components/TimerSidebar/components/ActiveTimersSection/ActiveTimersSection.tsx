import { Activity } from 'lucide-react'

import { ActiveTimerRow } from '../ActiveTimerRow'

import type { ActiveTimersSectionProps } from './ActiveTimersSection.types'

export function ActiveTimersSection(props: ActiveTimersSectionProps): React.JSX.Element {
  const { instances, primaryId, onSelect, onRemove } = props

  return (
    <div className="px-2 pt-3">
      <SectionHeader count={instances.length} />
      {instances.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-1">
          {instances.map((inst) => (
            <ActiveTimerRow
              key={inst.id}
              instance={inst}
              isPrimary={inst.id === primaryId}
              onSelect={() => onSelect(inst.id)}
              onRemove={() => onRemove(inst.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SectionHeader(props: { count: number }): React.JSX.Element {
  const { count } = props
  return (
    <div className="flex items-center justify-between px-2 mb-2">
      <div className="flex items-center gap-1.5">
        <Activity size={11} className="text-muted-foreground/70" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Active
        </span>
      </div>
      {count > 0 && (
        <span className="text-[10px] tabular-nums text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
          {count}
        </span>
      )}
    </div>
  )
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="mx-2 px-3 py-4 rounded-lg border border-dashed border-border/40 text-center">
      <p className="text-[11px] text-muted-foreground">
        No active timers.
      </p>
      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
        Pick a preset below to start.
      </p>
    </div>
  )
}
