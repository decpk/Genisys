import { useCallback } from 'react'

import { useDragFraction } from '../../hooks/useDragFraction'
import type { HueSliderProps } from './HueSlider.types'

export interface UseHueSliderData {
  containerRef: React.RefObject<HTMLDivElement | null>
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  thumbLeft: string
  thumbBackground: string
}

const RAINBOW_BACKGROUND =
  'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))'

export const HUE_SLIDER_BACKGROUND = RAINBOW_BACKGROUND

/** Maps pointer fractions to hue and computes thumb position. */
export function useHueSliderData(props: HueSliderProps): UseHueSliderData {
  const { hue, onChange } = props

  const handleDrag = useCallback(
    (fractionX: number): void => {
      const nextHue = Math.round(fractionX * 360)
      onChange(nextHue)
    },
    [onChange],
  )

  const drag = useDragFraction(handleDrag)

  return {
    containerRef: drag.containerRef,
    onPointerDown: drag.onPointerDown,
    onPointerMove: drag.onPointerMove,
    onPointerUp: drag.onPointerUp,
    thumbLeft: `${(hue / 360) * 100}%`,
    thumbBackground: `hsl(${hue}, 100%, 50%)`,
  }
}
