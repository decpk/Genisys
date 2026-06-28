import { MinutesStepper } from '@/components/ui/minutes-stepper'

import type { SessionsBetweenLongBreakRowProps } from './SessionsBetweenLongBreakRow.types'

export function SessionsBetweenLongBreakRow(
  props: SessionsBetweenLongBreakRowProps,
): React.JSX.Element {
  const { value, onChange } = props

  return (
    <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40 mt-1">
      <div className="flex flex-col min-w-0">
        <span className="text-[12px] font-medium text-foreground/90">Long break frequency</span>
        <span className="text-[10.5px] text-muted-foreground leading-tight">
          Insert a long break every N work sessions
        </span>
      </div>
      <MinutesStepper
        value={value}
        onChange={onChange}
        min={1}
        max={12}
        step={1}
        suffix="sess."
        ariaLabel="Sessions between long break"
      />
    </div>
  )
}
