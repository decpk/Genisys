import { useCallback, useState } from 'react'
import type { Editor } from '@tiptap/react'

export function useEditorRegistry() {
  const [editor, setEditor] = useState<Editor | null>(null)

  const registerEditor = useCallback((next: Editor | null) => {
    setEditor(next)
  }, [])

  return { editor, registerEditor }
}
