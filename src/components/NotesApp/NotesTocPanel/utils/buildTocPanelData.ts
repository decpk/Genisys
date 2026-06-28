import type { TocItem, TocPanelData } from '@/right-panels/TocPanel'

import type { NotesTocPositionedItem } from '../../NotesTocProvider'

/**
 * Strips internal `pos` / `type` fields from positioned items and pairs the
 * resulting `TocItem[]` with the current `activeItemId`. This keeps the
 * generic `TocPanel` framework decoupled from Notes-specific concerns.
 */
export function buildTocPanelData(
  items: NotesTocPositionedItem[],
  activeItemId: string | null,
): TocPanelData {
  const publicItems: TocItem[] = items.map((it) => ({
    id: it.id,
    label: it.label,
    level: it.level,
    icon: it.icon,
    iconColor: it.iconColor,
    badge: it.badge,
    isBookmarked: it.isBookmarked,
  }))
  return { items: publicItems, activeItemId }
}
