import { useState, useEffect, useRef } from 'react'

export function useChapterEditorPreview(content: string, debounceMs = 300) {
  const [debouncedContent, setDebouncedContent] = useState(content)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(content), debounceMs)
    return () => clearTimeout(timer)
  }, [content, debounceMs])

  return { debouncedContent }
}
