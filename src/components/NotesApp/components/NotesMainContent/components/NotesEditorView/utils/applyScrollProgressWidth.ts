/**
 * Writes a scroll-progress fraction (0–1) to a progress-bar element's width via
 * direct style mutation — no React state, no re-render. No-op when the element
 * is null.
 */
export function applyScrollProgressWidth(el: HTMLElement | null, progress: number): void {
  if (!el) return
  el.style.width = `${(progress * 100).toFixed(1)}%`
}
