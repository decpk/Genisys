import { useReportAppBusy } from '@/components/GenisysApp/app-activity-registry'
import { useLibraryStore } from '@/store/library-store'

/**
 * Reports Library as busy while ANY book, chapter, or translation is
 * generating, so the keep-alive LRU eviction never unmounts it mid-generation —
 * including when a book generates in the BACKGROUND while the user views a
 * different book.
 *
 * Reads `generatingBookIds` from `library-store`: a live, in-memory set that is
 * added to when a generation starts and removed on completion / error / stop
 * (see `useBookGenerator` → `activateBookUI` and its terminal transitions). The
 * selector returns a primitive boolean (`size > 0`) — never the Set itself — so
 * it stays referentially stable per the zustand-selector contract.
 *
 * The earlier `BookGeneratorContext.phase` signal only reflected the
 * CURRENTLY-VIEWED book, so background generations were under-reported and
 * Library could be evicted mid-generation. `sessionBookIds` is unusable here
 * (append-only — never cleared), and the persisted `status` can get stuck on
 * `'generating'`; `generatingBookIds` avoids both pitfalls.
 */
export function useReportLibraryBusy(): void {
  const isGenerating = useLibraryStore((s) => s.generatingBookIds.size > 0)
  useReportAppBusy('library', isGenerating)
}
