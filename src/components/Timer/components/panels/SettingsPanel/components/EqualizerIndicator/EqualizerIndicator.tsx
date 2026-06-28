import { cn } from '@/lib/utils'

import {
  EQUALIZER_BAR,
  EQUALIZER_BAR_DELAYS,
  EQUALIZER_BAR_HEIGHTS,
  EQUALIZER_KEYFRAMES,
  EQUALIZER_WRAPPER,
} from './EqualizerIndicator.styles'
import type { EqualizerIndicatorProps } from './EqualizerIndicator.types'

export function EqualizerIndicator(props: EqualizerIndicatorProps): React.JSX.Element {
  const { className, size = 14 } = props

  const bars = EQUALIZER_BAR_HEIGHTS.map((height, index) => {
    const delay = EQUALIZER_BAR_DELAYS[index] ?? '0ms'
    return (
      <span
        key={index}
        className={EQUALIZER_BAR}
        style={{
          height,
          animationName: 'settings-eq-bar-bounce',
          animationDuration: '0.85s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          animationDelay: delay,
          transformOrigin: 'bottom',
        }}
      />
    )
  })

  return (
    <span
      className={cn(EQUALIZER_WRAPPER, className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: EQUALIZER_KEYFRAMES }} />
      {bars}
    </span>
  )
}
