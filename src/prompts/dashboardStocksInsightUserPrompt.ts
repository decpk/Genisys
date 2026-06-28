import type { StockNewsItem, StockQuote, StockWatchItem } from '@/store/stocks-tile-store'

export interface BuildUserPromptInput {
  item: StockWatchItem
  quote: StockQuote | undefined
  news: StockNewsItem[]
}

function fmtNum(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return 'n/a'
  return n.toFixed(digits)
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return 'n/a'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

/**
 * Build the user-message payload for the AI insight call. Plain text — the
 * model is instructed by the system prompt to return strict JSON.
 */
export function buildStockAiInsightUserPrompt({ item, quote, news }: BuildUserPromptInput): string {
  const symbol = item.symbol.toUpperCase()
  const company = item.longName || item.shortName || symbol
  const exchange = item.exchange || 'unknown exchange'

  const quoteBlock = quote
    ? [
        `current_price: ${fmtNum(quote.price)} ${quote.currency || ''}`.trim(),
        `prev_close: ${fmtNum(quote.prevClose)}`,
        `change_pct: ${fmtPct(quote.changePct)}`,
        `day_range: ${fmtNum(quote.dayLow)} – ${fmtNum(quote.dayHigh)}`,
        `52w_range: ${fmtNum(quote.fiftyTwoWeekLow)} – ${fmtNum(quote.fiftyTwoWeekHigh)}`,
        `market_state: ${quote.marketState || 'unknown'}`,
      ].join('\n')
    : 'No live quote available.'

  const trimmed = news.slice(0, 10)
  const newsBlock =
    trimmed.length === 0
      ? 'No recent headlines available.'
      : trimmed
          .map((n, i) => {
            const date = n.publishedAt ? n.publishedAt.slice(0, 10) : 'date unknown'
            const pub = n.publisher || 'unknown publisher'
            return `${i + 1}. [${date}] (${pub}) ${n.title}`
          })
          .join('\n')

  return `Ticker: ${symbol}
Company: ${company}
Exchange: ${exchange}

Latest quote snapshot:
${quoteBlock}

Recent headlines (newest first, max 10):
${newsBlock}

Return ONLY the JSON object as instructed.`
}
