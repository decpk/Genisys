import { createContext, useContext } from 'react'

type InsertSnippetFn = (content: string) => void

const InsertSnippetContext = createContext<InsertSnippetFn | undefined>(undefined)

export function InsertSnippetProvider({
  onInsertSnippet,
  children,
}: {
  onInsertSnippet?: InsertSnippetFn
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <InsertSnippetContext.Provider value={onInsertSnippet}>
      {children}
    </InsertSnippetContext.Provider>
  )
}

export function useInsertSnippet(): InsertSnippetFn | undefined {
  return useContext(InsertSnippetContext)
}
