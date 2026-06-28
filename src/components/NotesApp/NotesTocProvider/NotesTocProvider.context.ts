import { createContext, useContext } from 'react'
import type { NotesTocContextValue } from './NotesTocProvider.types'

export const NotesTocContext = createContext<NotesTocContextValue | null>(null)

export function useNotesToc(): NotesTocContextValue {
  const ctx = useContext(NotesTocContext)
  if (!ctx) throw new Error('useNotesToc must be used within NotesTocProvider')
  return ctx
}
