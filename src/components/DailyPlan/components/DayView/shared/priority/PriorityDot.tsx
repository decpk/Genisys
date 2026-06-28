import { cn } from '@/lib/utils'
import { priorityDotStyles as s } from './PriorityDot.styles'
import type { PriorityVisual } from './getPriorityVisual'

interface PriorityDotProps {
  visual: PriorityVisual
  /** Show the short label for emphasized tiers. Defaults to true. */
  showLabel?: boolean
  className?: string
}

/**
 * A single, minimal priority signal: a small colored dot. Emphasized tiers
 * (urgent / critical / high) get a soft ring halo + a short uppercase label;
 * calmer tiers render a muted dot only. Replaces the noisy multi-color bar.
 */
export function PriorityDot(props: PriorityDotProps): React.JSX.Element {
  const { visual, showLabel = true, className } = props

  return (
    <span className={cn(s.wrapper, className)}>
      <span
        aria-hidden
        className={cn(s.dot, !visual.emphasized && s.dotMuted)}
        style={{
          backgroundColor: visual.color,
          boxShadow: visual.emphasized ? `0 0 0 3px ${visual.color}26` : undefined,
        }}
      />
      {showLabel && visual.label && (
        <span className={s.label} style={{ color: visual.color }}>
          {visual.label}
        </span>
      )}
    </span>
  )
}
