import type { TimerRunningDotProps } from './TimerRunningDot.types'

export function TimerRunningDot(props: TimerRunningDotProps): React.JSX.Element {
  const { color } = props
  return (
    <span
      className="size-1.5 rounded-full animate-pulse"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  )
}
