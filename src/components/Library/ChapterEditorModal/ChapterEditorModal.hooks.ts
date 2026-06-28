import { useState, useCallback, useEffect } from 'react'

import { useLibraryStore } from '@/store/library-store'
import type { Chapter } from '@/store/library-store'

export function useChapterEditorModal(chapter: Chapter, bookId: string) {
  const [editingContent, setEditingContent] = useState(chapter.content)
  const isDirty = editingContent !== chapter.content
  const updateChapterContent = useLibraryStore((s) => s.updateChapterContent)

  // Reset editing content when chapter changes
  useEffect(() => {
    setEditingContent(chapter.content)
  }, [chapter.id, chapter.content])

  const handleSave = useCallback(async () => {
    await updateChapterContent(chapter.id, editingContent, bookId)
  }, [chapter.id, editingContent, bookId, updateChapterContent])

  return {
    editingContent,
    setEditingContent,
    isDirty,
    handleSave,
  }
}
