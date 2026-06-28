import { useEffect } from 'react'

import { useLibraryStore } from '@/store/library-store'
import { useSettingsStore } from '@/store/settings-store'

import { appendImageCreditsIfMissing } from '../utils/appendImageCreditsIfMissing'
import { buildImageCreditsBlock } from '../utils/buildImageCreditsBlock'
import { extractImageUrls } from '../utils/extractImageUrls'
import { rewriteImageUrls } from '../utils/rewriteImageUrls'

interface BackfillTarget {
  bookId: string
  chapterId: string
  /** Current chapter markdown — may contain a mix of remote and offline URLs. */
  markdown: string
}

/**
 * Hook that runs when a chapter is opened: if the chapter still has external
 * `http(s)://` image URLs (i.e. it was generated before offline caching was
 * wired up), kick off a background cache so the user gets offline images on
 * the next reload. Completely no-ops when caching is disabled or the chapter
 * already has every image cached.
 */
export function useChapterImageBackfill(target: BackfillTarget | null): void {
  useEffect(() => {
    if (!target) return
    const { bookId, chapterId, markdown } = target
    if (!bookId || !chapterId || !markdown) return

    const enabled = useSettingsStore.getState().libraryCacheImagesForOffline !== false
    if (!enabled) return

    // Only run when there is at least one remote URL that *isn't* already
    // pointing at the offline scheme. This keeps the hook idempotent.
    const urls = extractImageUrls(markdown)
    if (urls.length === 0) return

    let cancelled = false
    const run = async () => {
      try {
        const api = (window as unknown as { api?: { cacheChapterImages?: (b: string, c: string, m: string) => Promise<{ images: any[] }> } }).api
        if (!api?.cacheChapterImages) return
        const result = await api.cacheChapterImages(bookId, chapterId, markdown)
        if (cancelled) return
        const records = result?.images ?? []
        if (records.length === 0) return
        const rewritten = rewriteImageUrls(markdown, records)
        const credits = buildImageCreditsBlock(records)
        const withCredits = appendImageCreditsIfMissing(rewritten, credits)
        if (withCredits === markdown) return
        const store = useLibraryStore.getState()
        await store.updateChapterContent(chapterId, withCredits, bookId)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[library] useChapterImageBackfill failed', err)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [target?.bookId, target?.chapterId, target?.markdown])
}
