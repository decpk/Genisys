import { useCallback, useMemo } from 'react'

import { formatHsl } from '@/themes/utils/colorConversion/formatHsl'
import { hexToHsl } from '@/themes/utils/colorConversion/hexToHsl'
import { hslToHex } from '@/themes/utils/colorConversion/hslToHex'
import { parseHsl } from '@/themes/utils/colorConversion/parseHsl'

interface UseColorTokenFieldData {
  hsl: { h: number; s: number; l: number }
  hex: string
  isFallback: boolean
  swatchColor: string
  changeChannel: (channel: 'h' | 's' | 'l', raw: string) => void
  changeHex: (raw: string) => void
  enableOverride: () => void
  disableOverride: () => void
}

export function useColorTokenFieldData(
  value: string | undefined,
  fallbackHsl: { h: number; s: number; l: number },
  optional: boolean,
  onChange: (next: string | undefined) => void,
): UseColorTokenFieldData {
  const isFallback = optional && (value === undefined || value === null || value === '')

  const hsl = useMemo(() => {
    if (typeof value === 'string' && value.length > 0) {
      const parsed = parseHsl(value)
      if (parsed) return parsed
    }
    return fallbackHsl
  }, [value, fallbackHsl])

  const hex = useMemo(() => hslToHex(hsl.h, hsl.s, hsl.l), [hsl])

  const swatchColor = isFallback ? 'transparent' : `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`

  const changeChannel = useCallback(
    (channel: 'h' | 's' | 'l', raw: string) => {
      const num = Number(raw)
      const next = { ...hsl }
      if (Number.isFinite(num)) next[channel] = num
      onChange(formatHsl(next.h, next.s, next.l))
    },
    [hsl, onChange],
  )

  const changeHex = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (trimmed.length === 0) return
      const parsed = hexToHsl(trimmed)
      if (!parsed) return
      onChange(formatHsl(parsed.h, parsed.s, parsed.l))
    },
    [onChange],
  )

  const enableOverride = useCallback(() => {
    onChange(formatHsl(fallbackHsl.h, fallbackHsl.s, fallbackHsl.l))
  }, [fallbackHsl, onChange])

  const disableOverride = useCallback(() => {
    onChange(undefined)
  }, [onChange])

  return { hsl, hex, isFallback, swatchColor, changeChannel, changeHex, enableOverride, disableOverride }
}
