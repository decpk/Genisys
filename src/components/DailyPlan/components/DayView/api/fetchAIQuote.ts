import { DAILY_PLAN_QUOTE_SYSTEM_PROMPT } from '@/prompts/dailyPlanQuoteSystemPrompt'
import { DAILY_PLAN_QUOTE_USER_PROMPT } from '@/prompts/dailyPlanQuoteUserPrompt'

interface AIQuoteResponse {
  text: string
  author: string
}

export async function fetchAIQuote(): Promise<AIQuoteResponse> {
  const result = await window.api.llmJsonCompletion({
    systemPrompt: DAILY_PLAN_QUOTE_SYSTEM_PROMPT,
    userPrompt: DAILY_PLAN_QUOTE_USER_PROMPT,
  })

  if (!result.success || !result.content) {
    throw new Error(result.error || 'Failed to fetch AI quote')
  }

  const parsed = JSON.parse(result.content)
  return { text: parsed.text, author: parsed.author }
}
