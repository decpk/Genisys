import { createContext, useContext } from 'react'
import { useBookGenerator } from './useBookGenerator'

type BookGeneratorContextValue = ReturnType<typeof useBookGenerator>

const BookGeneratorContext = createContext<BookGeneratorContextValue | null>(null)

export function BookGeneratorProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const generator = useBookGenerator()
  return (
    <BookGeneratorContext.Provider value={generator}>
      {children}
    </BookGeneratorContext.Provider>
  )
}

export function useBookGeneratorContext(): BookGeneratorContextValue {
  const ctx = useContext(BookGeneratorContext)
  if (!ctx) throw new Error('useBookGeneratorContext must be used within BookGeneratorProvider')
  return ctx
}
