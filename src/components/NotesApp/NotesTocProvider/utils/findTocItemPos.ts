import type { NotesTocPositionedItem } from '../NotesTocProvider.types'

export function findTocItemPos(items: NotesTocPositionedItem[], id: string): number | null {
  const item = items.find((i) => i.id === id)
  if (!item) return null
  return item.pos
}
