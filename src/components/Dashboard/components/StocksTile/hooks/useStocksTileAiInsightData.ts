import { useCallback } from 'react'

import { useStocksTileStore } from '@/store/stocks-tile-store'
import type { StockWatchItem } from '@/store/stocks-tile-store'
import { resolveAppModel } from '@/lib/resolveAppModel'

import { generateStockAiInsight } from '../api/generateStockAiInsight'

interface GenerateOptions {
  /** Override the default model. */
  model?: string
}

/**
 * Hook that drives AI insight generation for a single watch item.
 *
 * Threads loading / error state through the store so any consumer
 * (insight card, header, etc.) shares the same signal.
 */
export function useStocksTileAiInsightData() {
  const items = useStocksTileStore((s) => s.items)
  const quoteBySymbol = useStocksTileStore((s) => s.quoteBySymbol)
  const newsByItem = useStocksTileStore((s) => s.newsByItem)

  const setAiInsight = useStocksTileStore((s) => s.setAiInsight)
  const setAiInsightLoading = useStocksTileStore((s) => s.setAiInsightLoading)
  const setAiInsightError = useStocksTileStore((s) => s.setAiInsightError)

  const generateAiInsightFor = useCallback(
    async (itemId: string, opts: GenerateOptions = {}) => {
      const item: StockWatchItem | undefined = items.find((it) => it.id === itemId)
      if (!item) return null

      setAiInsightError(itemId, null)
      setAiInsightLoading(itemId, true)
      try {
        const insight = await generateStockAiInsight({
          item,
          quote: quoteBySymbol[item.symbol],
          news: newsByItem[itemId] ?? [],
          model: opts.model ?? resolveAppModel('dashboard'),
        })
        setAiInsight(itemId, insight)
        return insight
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to generate AI insight'
        setAiInsightError(itemId, msg)
        return null
      } finally {
        setAiInsightLoading(itemId, false)
      }
    },
    [items, quoteBySymbol, newsByItem, setAiInsight, setAiInsightError, setAiInsightLoading],
  )

  const clearAiInsightFor = useCallback(
    (itemId: string) => {
      setAiInsight(itemId, null)
      setAiInsightError(itemId, null)
    },
    [setAiInsight, setAiInsightError],
  )

  return { generateAiInsightFor, clearAiInsightFor }
}
