import type { LibraryGet, LibrarySet } from './types'

/**
 * Clears a book's active-generation marker. Called from every terminal
 * transition of a generation run — completion, parse/stream error, and user
 * stop — so `generatingBookIds` always returns to empty once nothing is
 * actually generating (the reliability the persisted `status` field can't
 * guarantee, since it can get stuck on `'generating'`).
 *
 * No-ops when the id is absent so we don't allocate a fresh `Set` reference
 * (and trigger spurious subscriber re-renders) when there is nothing to remove.
 */
export function clearBookGeneratingAction(get: LibraryGet, set: LibrarySet, bookId: string): void {
  const current = get().generatingBookIds
  if (!current.has(bookId)) return
  const next = new Set(current)
  next.delete(bookId)
  set({ generatingBookIds: next })
}
