import type { CSSProperties } from 'react'

export function buildClampStyle(clampLines?: number): CSSProperties | undefined {
  if (!clampLines || clampLines <= 0) return undefined
  return {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: clampLines,
    overflow: 'hidden',
  }
}
