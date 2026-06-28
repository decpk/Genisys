export interface StatsGoalProgressBarProps {
  /** Percent 0-100 (already clamped). */
  pct: number
  /** Label shown above the bar (e.g. "Weekly"). */
  label: string
  /** Right-aligned value text (e.g. "120m / 300m"). */
  valueLabel: string
}
