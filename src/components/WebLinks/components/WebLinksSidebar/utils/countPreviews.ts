import type {
  PreviewFolderSelection,
  SavedPreview,
} from '@/components/WebLinks/WebLinks.types'

/**
 * Count how many saved previews fall under a sidebar selection. Pure +
 * side-effect free so the sidebar hook can memoize it safely (never call it
 * inside a zustand selector).
 */
export function countPreviews(
  previews: SavedPreview[],
  selection: PreviewFolderSelection,
): number {
  if (selection === 'all') return previews.length
  if (selection === 'unfiled') {
    return previews.filter((preview) => preview.folderId === null).length
  }
  return previews.filter((preview) => preview.folderId === selection).length
}
