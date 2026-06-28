import { useCallback, useEffect, useState } from 'react'

import { hexToHsl } from '@/themes/utils/colorConversion/hexToHsl'
import { hslToHex } from '@/themes/utils/colorConversion/hslToHex'

import type { ColorPickerProps } from './ColorPicker.types'

const FALLBACK_HSL = { h: 0, s: 0, l: 50 }

export interface UseColorPickerData {
  hue: number
  saturation: number
  lightness: number
  handleSaturationLightnessChange: (s: number, l: number) => void
  handleHueChange: (h: number) => void
}

/**
 * Manages the picker's "active hue" so that even when the current color is
 * grayscale, dragging the hue slider produces a vibrant color.
 */
export function useColorPickerData(props: ColorPickerProps): UseColorPickerData {
  const { hex, onChange } = props
  const incoming = hexToHsl(hex) ?? FALLBACK_HSL
  const [activeHue, setActiveHue] = useState<number>(incoming.h)

  // Keep activeHue in sync when the parent passes a non-grayscale color.
  useEffect(() => {
    if (incoming.s > 0) {
      setActiveHue(incoming.h)
    }
  }, [incoming.h, incoming.s])

  const handleSaturationLightnessChange = useCallback(
    (s: number, l: number): void => {
      onChange(hslToHex(activeHue, s, l))
    },
    [activeHue, onChange],
  )

  const handleHueChange = useCallback(
    (h: number): void => {
      setActiveHue(h)
      // If the current color is grayscale, lift saturation so the hue change is visible.
      const sToUse = incoming.s > 0 ? incoming.s : 100
      onChange(hslToHex(h, sToUse, incoming.l))
    },
    [incoming.s, incoming.l, onChange],
  )

  return {
    hue: activeHue,
    saturation: incoming.s,
    lightness: incoming.l,
    handleSaturationLightnessChange,
    handleHueChange,
  }
}
