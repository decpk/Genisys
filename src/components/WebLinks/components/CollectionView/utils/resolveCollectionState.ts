/** Discrete states the collection view can render. */
export type CollectionState = 'loading' | 'empty' | 'no-matches' | 'grid'

/**
 * Resolve which collection state to show. Branch-ordered so the view can use
 * early-return guards instead of chained ternaries.
 *
 * - `loading`    — data hasn't loaded yet.
 * - `empty`      — loaded, but the user has saved nothing.
 * - `no-matches` — there are saved previews, but the active filter hides them.
 * - `grid`       — show the grid of visible previews.
 */
export function resolveCollectionState(
  isLoaded: boolean,
  totalCount: number,
  visibleCount: number,
): CollectionState {
  if (!isLoaded) return 'loading'
  if (totalCount === 0) return 'empty'
  if (visibleCount === 0) return 'no-matches'
  return 'grid'
}
