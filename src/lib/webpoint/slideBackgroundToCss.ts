import type { SlideBackground } from '@/store/webpoint-store/types'

/**
 * Convert a structured slide background into a CSS `background` shorthand value
 * (a solid colour or a gradient function). Shared by sidebar previews, the
 * stage, and the slide compiler.
 */
export function slideBackgroundToCss(background: SlideBackground): string {
  if (background.type === 'solid') return background.color

  const { gradient } = background
  const stops = gradient.stops.map((stop) => `${stop.color} ${stop.position}%`).join(', ')

  if (gradient.kind === 'radial') return `radial-gradient(circle, ${stops})`
  return `linear-gradient(${gradient.angle}deg, ${stops})`
}
