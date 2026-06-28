import { useMemo } from 'react'

import { useLibraryStore } from '@/store/library-store'

import { useBookGeneratorContext } from '../BookGeneratorContext'

export function useBookTableOfContents() {
  const activeBook = useLibraryStore((s) => s.activeBook)
  const selectChapter = useLibraryStore((s) => s.selectChapter)
  const { phase, generateChapter } = useBookGeneratorContext()

  const chapters = useMemo(() => activeBook?.chapters ?? [], [activeBook])
  const bookId = activeBook?.book.id ?? ''
  const isGenerating = phase === 'generating-toc' || phase === 'generating-chapter'

  return { chapters, bookId, isGenerating, selectChapter, generateChapter }
}
