import type { LibraryGet, LibrarySet } from './types'

/**
 * Marks a book as actively generating so eviction protection
 * (`useReportLibraryBusy`) keeps Library mounted while any book — including a
 * background book the user isn't currently viewing — is mid-generation.
 *
 * Call this when a generation STARTS. It is always paired with
 * `clearBookGeneratingAction`, which runs on completion, error, and stop so the
 * set never leaks (unlike the append-only `sessionBookIds`).
 *
 * No-ops when the id is already present so we don't allocate a fresh `Set`
 * reference (and trigger spurious subscriber re-renders) on repeat calls.
 */
export function markBookGeneratingAction(get: LibraryGet, set: LibrarySet, bookId: string): void {
  const current = get().generatingBookIds
  if (current.has(bookId)) return
  const next = new Set(current)
  next.add(bookId)
  set({ generatingBookIds: next })
}
