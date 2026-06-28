import type {
  PreviewFolderSelection,
  PreviewSortDirection,
  PreviewSortKey,
  SavedPreview,
} from '../WebLinks.types'

export interface VisiblePreviewOptions {
  selectedFolder: PreviewFolderSelection
  sortKey: PreviewSortKey
  sortDirection: PreviewSortDirection
  filterQuery: string
}

/**
 * Apply the active folder selection, free-text filter, and sort to the raw
 * saved-preview list. Pure + side-effect free so it is trivially unit-testable
 * and safe to memoize in the consuming hook (never call it inside a selector).
 */
export function selectVisiblePreviews(
  previews: SavedPreview[],
  options: VisiblePreviewOptions,
): SavedPreview[] {
  const { selectedFolder, sortKey, sortDirection, filterQuery } = options

  const byFolder = previews.filter((p) => {
    if (selectedFolder === 'all') return true
    if (selectedFolder === 'unfiled') return p.folderId === null
    return p.folderId === selectedFolder
  })

  const query = filterQuery.trim().toLowerCase()
  const filtered = query
    ? byFolder.filter((p) => {
        const haystack = `${p.title} ${p.siteName} ${p.url} ${p.description}`.toLowerCase()
        return haystack.includes(query)
      })
    : byFolder

  const direction = sortDirection === 'asc' ? 1 : -1
  const sorted = [...filtered].sort((a, b) => {
    let result: number
    if (sortKey === 'title') {
      result = (a.title || a.url).localeCompare(b.title || b.url)
    } else if (sortKey === 'siteName') {
      result = (a.siteName || a.url).localeCompare(b.siteName || b.url)
    } else {
      result = a.createdAt.localeCompare(b.createdAt)
    }
    return result * direction
  })

  return sorted
}
