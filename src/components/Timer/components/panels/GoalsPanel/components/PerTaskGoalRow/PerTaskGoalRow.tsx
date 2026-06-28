import { Trash2 } from 'lucide-react'

import { MinutesStepper } from '@/components/ui/minutes-stepper'
import { Tooltip } from '@/components/Tooltip'

import type { PerTaskGoalRowProps } from './PerTaskGoalRow.types'

export function PerTaskGoalRow(props: PerTaskGoalRowProps): React.JSX.Element {
  const { target, onChange, onRemove } = props

  return (
    <div className="flex items-center gap-2 py-1.5 text-xs">
      <span className="flex-1 truncate text-foreground/90">{target.taskId}</span>
      <MinutesStepper
        value={target.minutes ?? 0}
        onChange={(v) => onChange({ ...target, minutes: v })}
        min={0}
        max={1440}
        step={5}
        suffix="m"
        ariaLabel="Target minutes"
      />
      <Tooltip content="Remove" side="top">
        <button
          type="button"
          onClick={() => onRemove(target.taskId)}
          className="inline-flex size-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </Tooltip>
    </div>
  )
}
