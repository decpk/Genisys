import type { PreviewSortKey } from '@/components/WebLinks/WebLinks.types'

const LABELS: Record<PreviewSortKey, string> = {
  dateAdded: 'Date added',
  title: 'Title',
  siteName: 'Site name',
}

/** Human-friendly label for a sort key (lookup map — no chained ternaries). */
export function getSortKeyLabel(key: PreviewSortKey): string {
  return LABELS[key]
}
