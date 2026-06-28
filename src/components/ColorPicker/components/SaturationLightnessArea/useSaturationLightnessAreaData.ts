import { useCallback } from 'react'

import { useDragFraction } from '../../hooks/useDragFraction'
import type { SaturationLightnessAreaProps } from './SaturationLightnessArea.types'

export interface UseSaturationLightnessAreaData {
  containerRef: React.RefObject<HTMLDivElement | null>
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  background: string
  indicatorLeft: string
  indicatorTop: string
  indicatorBackground: string
}

/** Maps pointer fractions to (saturation, lightness) and computes visual style. */
export function useSaturationLightnessAreaData(
  props: SaturationLightnessAreaProps,
): UseSaturationLightnessAreaData {
  const { hue, saturation, lightness, onChange } = props

  const handleDrag = useCallback(
    (fractionX: number, fractionY: number): void => {
      const nextSaturation = Math.round(fractionX * 100)
      const nextLightness = Math.round((1 - fractionY) * 100)
      onChange(nextSaturation, nextLightness)
    },
    [onChange],
  )

  const drag = useDragFraction(handleDrag)

  const background = [
    'linear-gradient(to bottom, transparent 50%, #000 100%)',
    'linear-gradient(to top, transparent 50%, #fff 100%)',
    `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`,
  ].join(', ')

  return {
    containerRef: drag.containerRef,
    onPointerDown: drag.onPointerDown,
    onPointerMove: drag.onPointerMove,
    onPointerUp: drag.onPointerUp,
    background,
    indicatorLeft: `${saturation}%`,
    indicatorTop: `${100 - lightness}%`,
    indicatorBackground: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
  }
}
