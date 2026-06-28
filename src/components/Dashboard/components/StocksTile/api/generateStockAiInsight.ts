import type { StockAIInsight, StockNewsItem, StockQuote, StockWatchItem } from '@/store/stocks-tile-store'

import { extractJsonFromLlmResponse } from '../ai/extract-json-from-llm-response'
import { buildStockAiInsightUserPrompt } from '@/prompts/dashboardStocksInsightUserPrompt'
import { STOCKS_AI_INSIGHT_SYSTEM_PROMPT } from '@/prompts/dashboardStocksInsightSystemPrompt'

export interface GenerateStockAiInsightInput {
  item: StockWatchItem
  quote: StockQuote | undefined
  news: StockNewsItem[]
  model: string
}

interface RawAiInsight {
  summary?: unknown
  whyMoving?: unknown
  prediction?: unknown
  partnerships?: unknown
  risks?: unknown
  confidence?: unknown
}

function asNonEmptyString(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : fallback
}

function asConfidence(v: unknown): StockAIInsight['confidence'] {
  if (v === 'low' || v === 'medium' || v === 'high') return v
  return 'low'
}

/**
 * Call the LLM to generate a fresh AI insight for one watch item.
 * Throws when the bridge call fails or the response can't be parsed.
 */
export async function generateStockAiInsight({
  item,
  quote,
  news,
  model,
}: GenerateStockAiInsightInput): Promise<StockAIInsight> {
  const userPrompt = buildStockAiInsightUserPrompt({ item, quote, news })

  const result = await window.api.llmJsonCompletion({
    systemPrompt: STOCKS_AI_INSIGHT_SYSTEM_PROMPT,
    userPrompt,
    model,
  })

  if (!result.success || !result.content) {
    throw new Error(result.error || 'Failed to generate AI insight')
  }

  const parsed = extractJsonFromLlmResponse<RawAiInsight>(result.content)

  return {
    summary: asNonEmptyString(parsed.summary, 'No summary available.'),
    whyMoving: asNonEmptyString(parsed.whyMoving, 'No explanation available.'),
    prediction: asNonEmptyString(parsed.prediction, 'No outlook available.'),
    partnerships: asNonEmptyString(parsed.partnerships, 'No partnership signals in the recent news.'),
    risks: asNonEmptyString(parsed.risks, 'No specific risks highlighted.'),
    confidence: asConfidence(parsed.confidence),
    priceAtGeneration: quote?.price ?? 0,
    changePctAtGeneration: quote?.changePct ?? 0,
    currency: quote?.currency ?? '',
    generatedAt: new Date().toISOString(),
    model,
  }
}
