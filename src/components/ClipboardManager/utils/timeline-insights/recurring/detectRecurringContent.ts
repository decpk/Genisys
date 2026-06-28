import type { ClipboardItem } from '@/store/clipboard-store'
import type { RecurringItem } from './recurring.types'

const DEFAULT_THRESHOLD = 3
const PREVIEW_MAX_LENGTH = 100

export function detectRecurringContent(
  items: ClipboardItem[],
  threshold: number = DEFAULT_THRESHOLD
): RecurringItem[] {
  if (items.length === 0) return []

  const hashGroups = new Map<string, ClipboardItem[]>()

  for (const item of items) {
    if (!item.contentHash) continue
    const existing = hashGroups.get(item.contentHash)
    if (existing) {
      existing.push(item)
    } else {
      hashGroups.set(item.contentHash, [item])
    }
  }

  const recurring: RecurringItem[] = []

  for (const [hash, group] of hashGroups) {
    if (group.length < threshold) continue

    const sorted = group.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    const firstItem = sorted[0]
    const lastItem = sorted[sorted.length - 1]
    // Prefer the pinned representative if any item in the group is already
    // pinned (so toggle UI hits the right record); otherwise target the most
    // recent occurrence.
    const pinnedItem = group.find((i) => i.isPinned)
    const representative = pinnedItem ?? lastItem

    const preview = getPreview(firstItem)

    recurring.push({
      contentHash: hash,
      count: group.length,
      firstSeen: firstItem.createdAt,
      lastSeen: lastItem.createdAt,
      preview,
      isPinned: pinnedItem !== undefined,
      itemId: representative.id,
    })
  }

  recurring.sort((a, b) => b.count - a.count)

  return recurring
}

function getPreview(item: ClipboardItem): string {
  if (item.contentType === 'image') {
    return item.imageDescription ?? 'Image'
  }
  const text = item.textContent ?? ''
  if (text.length <= PREVIEW_MAX_LENGTH) return text
  return text.slice(0, PREVIEW_MAX_LENGTH) + '…'
}
