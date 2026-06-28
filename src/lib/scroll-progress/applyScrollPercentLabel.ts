import { formatScrollPercentLabel } from './formatScrollPercentLabel'

/**
 * Writes the scroll-progress percentage text (e.g. "42%") to a label element and
 * centers it horizontally on the leading edge of the fill (the last pixel of
 * progress), via direct DOM mutation — no React state, no re-render. The center
 * is clamped so the pill stays fully within the track width. No-op when the
 * element is null. The element is expected to use a `translateX(-50%)` transform
 * so `left` represents its horizontal center, and to be a direct child of the
 * track element whose width bounds the clamping.
 */
export function applyScrollPercentLabel(el: HTMLElement | null, progress: number): void {
  if (!el) return

  const text = formatScrollPercentLabel(progress)
  if (el.textContent !== text) el.textContent = text

  let fraction = progress
  if (fraction < 0) fraction = 0
  else if (fraction > 1) fraction = 1

  const track = el.parentElement
  if (!track) {
    el.style.left = `${(fraction * 100).toFixed(1)}%`
    return
  }

  const trackWidth = track.clientWidth
  const half = el.offsetWidth / 2
  let center = fraction * trackWidth
  if (center < half) center = half
  const max = trackWidth - half
  if (center > max) center = max
  el.style.left = `${center}px`
}
