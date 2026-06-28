import { createContext, useContext } from 'react'
import type { VoiceInputContextValue } from './VoiceInput.types'

export const VoiceInputContext = createContext<VoiceInputContextValue | null>(null)

export function useVoiceInputContext(): VoiceInputContextValue {
  const ctx = useContext(VoiceInputContext)
  if (!ctx) throw new Error('useVoiceInputContext must be used within VoiceInputProvider')
  return ctx
}
