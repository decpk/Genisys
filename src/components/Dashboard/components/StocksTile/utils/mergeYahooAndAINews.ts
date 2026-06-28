import type { StockNewsItem } from '@/store/stocks-tile-store'

import { dedupeNewsItems } from './dedupeNewsItems'

/**
 * Merges Yahoo Finance news (authoritative, with provider + publish time)
 * with optional AI-generated news, preferring the Yahoo version on conflict.
 */
export function mergeYahooAndAINews(
  yahoo: StockNewsItem[],
  ai: StockNewsItem[],
): StockNewsItem[] {
  return dedupeNewsItems([...yahoo, ...ai]).sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return tb - ta
  })
}
