import { useMemo } from 'react'

import { useLibraryStore } from '@/store/library-store'

import type { ProgressBannerData } from './ProgressBanner.types'

export function useProgressBanner(): ProgressBannerData {
  const activeBook = useLibraryStore((s) => s.activeBook)

  return useMemo(() => {
    const chapters = activeBook?.chapters ?? []

    const statusCounts = chapters.reduce(
      (acc, ch) => {
        acc[ch.status] = (acc[ch.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const completedCount = statusCounts.completed || 0
    const readCount = chapters.filter((c) => c.isRead).length
    const progressPercent = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0

    return {
      completedCount,
      chaptersCount: chapters.length,
      readCount,
      pendingCount: statusCounts.pending ?? 0,
      errorCount: statusCounts.error ?? 0,
      progressPercent,
      isVisible: completedCount > 0,
    }
  }, [activeBook])
}
