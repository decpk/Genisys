import { useState, useCallback } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { MOTIVATIONAL_QUOTES } from '../../constants'
import { fetchAIQuote } from './api/fetchAIQuote'

interface QuoteData {
  text: string
  author: string
}

function hashDate(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function useMotivationalQuoteData() {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const initialIndex = hashDate(selectedDate) % MOTIVATIONAL_QUOTES.length
  const staticQuote = MOTIVATIONAL_QUOTES[initialIndex]

  const [aiQuote, setAiQuote] = useState<QuoteData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fallbackIndex, setFallbackIndex] = useState(initialIndex)

  const quote = aiQuote ?? MOTIVATIONAL_QUOTES[fallbackIndex]

  const handleShuffle = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchAIQuote()
      setAiQuote(result)
    } catch {
      // Fallback to next static quote
      setFallbackIndex((prev) => {
        let next = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
        if (next === prev && MOTIVATIONAL_QUOTES.length > 1) {
          next = (next + 1) % MOTIVATIONAL_QUOTES.length
        }
        return next
      })
      setAiQuote(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { quote, isLoading, handleShuffle }
}
