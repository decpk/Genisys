/**
 * Build a responsive font-size expression. Slide font sizes are authored in px
 * against the 1280px-wide base canvas, then scaled to the actual render width
 * using viewport (`vw`, inside the stage iframe) or container (`cqw`, in DOM
 * thumbnails) units so text scales proportionally at any size.
 */
export function scaleFont(px: number, unit: 'vw' | 'cqw' | 'px'): string {
  if (unit === 'px') return `${px}px`
  return `calc(${px} / 1280 * 100${unit})`
}
