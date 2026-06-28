import type { StockAIInsight, StockWatchItem } from '@/store/stocks-tile-store'

export interface StockAiInsightCardProps {
  item: StockWatchItem
  insight: StockAIInsight | null
  loading: boolean
  error: string | null
  /** Triggered when the user clicks Generate / Regenerate. */
  onGenerate: () => void
  /** Triggered when the user clicks Clear (only shown when insight exists). */
  onClear?: () => void
  /** When true, the parent has zero recent news → the card adapts its CTA copy. */
  hasNews?: boolean
}
