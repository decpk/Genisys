import { useMemo } from 'react'

import { useLibraryStore } from '@/store/library-store'

import { useBookGeneratorContext } from '../BookGeneratorContext'
import type { GenerationStatusData } from './GenerationStatus.types'

export function useGenerationStatus(): GenerationStatusData {
  const activeBook = useLibraryStore((s) => s.activeBook)
  const {
    phase,
    currentChapterIndex,
    totalChapters,
    streamingContent,
    error,
    bookStartedAt,
    chapterStartedAt,
    generateAllChapters,
    stopGeneration,
  } = useBookGeneratorContext()

  const chapters = activeBook?.chapters ?? []
  const bookId = activeBook?.book.id ?? ''
  const isGenerating = phase === 'generating-toc' || phase === 'generating-chapter'

  const { hasPending, chaptersExist } = useMemo(() => {
    const statusCounts = chapters.reduce(
      (acc, ch) => {
        acc[ch.status] = (acc[ch.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      hasPending: (statusCounts.pending || 0) + (statusCounts.error || 0) > 0,
      chaptersExist: chapters.length > 0,
    }
  }, [chapters])

  return {
    isGenerating,
    phase,
    currentChapterIndex,
    totalChapters,
    streamingContent,
    error,
    hasPending,
    chaptersExist,
    bookId,
    bookStartedAt,
    chapterStartedAt,
    generateAllChapters,
    stopGeneration,
  }
}
