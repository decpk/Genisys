import { formatPresetMinutes } from '../../utils/formatPresetMinutes'
import type { PresetHoverCardProps } from './PresetHoverCard.types'

const MODE_LABELS: Record<string, string> = {
  pomodoro: 'Pomodoro',
  countdown: 'Countdown',
  stopwatch: 'Stopwatch',
}

export function PresetHoverCard(props: PresetHoverCardProps): React.JSX.Element {
  const { preset } = props
  const Icon = preset.icon
  const modeLabel = MODE_LABELS[preset.mode] ?? preset.mode
  const showDurations = preset.mode !== 'stopwatch'

  return (
    <div className="flex flex-col gap-3 p-3.5">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/60 text-foreground">
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">{preset.label}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{preset.tagline}</div>
        </div>
        <span className="text-[10px] uppercase tracking-wider rounded bg-muted/60 px-1.5 py-0.5 text-muted-foreground shrink-0">
          {modeLabel}
        </span>
      </div>

      {/* Durations */}
      {showDurations && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border/50 bg-muted/30 px-2.5 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Work</div>
            <div className="text-sm font-medium tabular-nums mt-0.5">
              {formatPresetMinutes(preset.durationSec)}
            </div>
          </div>
          {preset.breakSec !== undefined && (
            <div className="rounded-md border border-border/50 bg-muted/30 px-2.5 py-1.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Break</div>
              <div className="text-sm font-medium tabular-nums mt-0.5">
                {formatPresetMinutes(preset.breakSec)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-xs leading-relaxed text-muted-foreground">{preset.description}</p>

      {/* Best for */}
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Best for
        </div>
        <ul className="flex flex-col gap-0.5">
          {preset.bestFor.map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-xs">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/50" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
