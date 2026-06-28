import type { StockNewsItem } from '@/store/stocks-tile-store'

import { articleHash } from './articleHash'

export function dedupeNewsItems(items: StockNewsItem[]): StockNewsItem[] {
  const seen = new Set<string>()
  const out: StockNewsItem[] = []
  for (const item of items) {
    const key = articleHash(item.title, item.url)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}
