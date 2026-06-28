import { Hourglass } from 'lucide-react'

import { cn } from '@/lib/utils'

import { SVG_BASE_CLASS } from './TimerEmptyStateGlyph.styles'
import type { TimerEmptyStateGlyphProps } from './TimerEmptyStateGlyph.types'

export function TimerEmptyStateGlyph(
  props: TimerEmptyStateGlyphProps,
): React.JSX.Element {
  const { className } = props
  return (
    <Hourglass
      className={cn(SVG_BASE_CLASS, className)}
      strokeWidth={1.25}
      role="img"
      aria-hidden="true"
    />
  )
}
