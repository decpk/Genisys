import type { HeroDurationPillsProps } from './HeroDurationPills.types'

export function HeroDurationPills(props: HeroDurationPillsProps): React.JSX.Element {
  const { workMin, shortBreakMin, longBreakMin, sessionsBetweenLongBreak } = props

  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex items-baseline gap-1.5 tabular-nums">
        <span className="text-[18px] font-semibold text-foreground leading-none">
          {workMin}
        </span>
        <span className="text-[10.5px] text-muted-foreground">/ {shortBreakMin} / {longBreakMin}</span>
        <span className="text-[10.5px] text-muted-foreground">min</span>
      </div>
      <span className="text-[10.5px] text-muted-foreground leading-tight">
        Long break every {sessionsBetweenLongBreak} sessions
      </span>
    </div>
  )
}
