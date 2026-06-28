import { createContext, useContext, useCallback, useRef } from 'react'

type SelectionListener = (text: string, chapterTitle: string) => void

interface LibraryAIContextValue {
  addSelectionToContext: (text: string, chapterTitle: string) => void
  registerSelectionListener: (listener: SelectionListener) => () => void
}

const LibraryAICtx = createContext<LibraryAIContextValue | null>(null)

export function LibraryAIContextProvider({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const listenerRef = useRef<SelectionListener | null>(null)

  const addSelectionToContext = useCallback(
    (text: string, chapterTitle: string) => {
      listenerRef.current?.(text, chapterTitle)
    },
    [],
  )

  const registerSelectionListener = useCallback(
    (listener: SelectionListener) => {
      listenerRef.current = listener
      return () => {
        if (listenerRef.current === listener) {
          listenerRef.current = null
        }
      }
    },
    [],
  )

  return (
    <LibraryAICtx.Provider
      value={{ addSelectionToContext, registerSelectionListener }}
    >
      {children}
    </LibraryAICtx.Provider>
  )
}

export function useLibraryAIContext(): LibraryAIContextValue {
  const ctx = useContext(LibraryAICtx)
  if (!ctx)
    throw new Error(
      'useLibraryAIContext must be used within LibraryAIContextProvider',
    )
  return ctx
}
