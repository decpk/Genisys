import { cn } from '@/lib/utils'
import { sectionProgressBarStyles as s } from './SectionProgressBar.styles'
import type { SectionProgressBarProps } from './SectionProgressBar.types'

/**
 * Animated emerald gradient progress bar used by the Today's Tasks section.
 * Pulses softly when fully complete to celebrate the win.
 */
export function SectionProgressBar(props: SectionProgressBarProps): React.JSX.Element {
  const { percent } = props
  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  const isComplete = clamped >= 100
  const fillClass = cn(s.fill, isComplete && s.fillComplete)

  return (
    <div className={s.container}>
      <div className={s.track}>
        <div className={fillClass} style={{ width: `${clamped}%` }} />
      </div>
      <span className={s.label}>{clamped}%</span>
    </div>
  )
}
