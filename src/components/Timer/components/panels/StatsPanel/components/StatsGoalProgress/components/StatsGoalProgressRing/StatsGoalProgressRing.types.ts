export interface StatsGoalProgressRingProps {
  /** Percent 0-100. Used to compute the stroke-dashoffset. */
  pct: number
  /** Size of the SVG square in px. */
  size?: number
  /** Stroke width of both the track and progress arc. */
  strokeWidth?: number
  /** Big number rendered in the center (already formatted by caller). */
  centerLabel: string
  /** Small label rendered below the big number. */
  centerSubLabel: string
}
