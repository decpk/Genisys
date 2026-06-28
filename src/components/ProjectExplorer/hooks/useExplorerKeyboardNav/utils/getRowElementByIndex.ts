/**
 * Find the rendered row element inside the explorer scroll container by its
 * `data-index` attribute (set by each view mode on each rendered row).
 *
 * Returns null if the container is detached or the index isn't rendered yet
 * (e.g. virtualized off-screen).
 */
export function getRowElementByIndex(
  container: HTMLElement | null,
  index: number
): HTMLElement | null {
  if (!container || index < 0) return null
  return container.querySelector<HTMLElement>(`[data-index="${index}"]`)
}
