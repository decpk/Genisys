import type { CSSProperties } from 'react'

import type { ThemeColors } from '@/themes'

export function buildCardContainerStyle(colors: ThemeColors, isActive: boolean): CSSProperties {
  const { primary, border, background } = colors

  const baseShadow = '0 1px 2px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.08)'
  const activeGlow = `0 10px 30px color-mix(in srgb, ${primary} 35%, transparent)`

  let boxShadow: string
  if (isActive) {
    boxShadow = `0 0 0 2px ${background}, 0 0 0 4px ${primary}, ${activeGlow}`
  } else {
    boxShadow = `0 0 0 1px ${border}, ${baseShadow}`
  }

  return { borderRadius: '16px', boxShadow }
}
