import { createContext, useContext } from 'react'
import type { TtsContextValue } from './TextToSpeech.types'

export const TextToSpeechContext = createContext<TtsContextValue | null>(null)

export function useTextToSpeechContext(): TtsContextValue {
  const ctx = useContext(TextToSpeechContext)
  if (!ctx) throw new Error('useTextToSpeechContext must be used within TextToSpeechProvider')
  return ctx
}
