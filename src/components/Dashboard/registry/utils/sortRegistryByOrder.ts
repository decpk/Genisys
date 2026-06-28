/**
 * Sort an array of items by a saved id order while preserving any items
 * not present in the saved order (appended at the end, in their original order).
 *
 * Pure function — no React/store usage. Used to apply `useSettingsStore.tileOrder`
 * to the freshly-built tile registry.
 */
export function sortRegistryByOrder<T extends { id: string }>(
  items: T[],
  savedOrder: string[]
): T[] {
  if (savedOrder.length === 0) return items

  const itemsById = new Map(items.map((i) => [i.id, i]))
  const visited = new Set<string>()
  const ordered: T[] = []

  for (const id of savedOrder) {
    const item = itemsById.get(id)
    if (!item) continue
    ordered.push(item)
    visited.add(id)
  }

  for (const item of items) {
    if (visited.has(item.id)) continue
    ordered.push(item)
  }

  return ordered
}
