import { cn } from '@/lib/utils'

import type { FocusStatusPillProps } from './FocusStatusPill.types'

const ROOT_CLASS =
  'inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/60 backdrop-blur-sm px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground'

export function FocusStatusPill(props: FocusStatusPillProps): React.JSX.Element {
  const { label, color, isRunning } = props
  const dotPulse = isRunning ? 'animate-pulse' : ''
  return (
    <div className={ROOT_CLASS}>
      <span
        className={cn('size-1.5 rounded-full', dotPulse)}
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  )
}
