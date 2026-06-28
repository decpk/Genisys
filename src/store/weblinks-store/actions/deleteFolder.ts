import type {
  WebLinksStoreActions,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'
import { removeFolder } from '@/components/WebLinks/api/removeFolder'

/**
 * Delete a folder. Mirrors the backend's non-cascading behavior locally:
 * the folder's previews are unfiled (folderId → null) and its sub-folders are
 * reparented to root (parentId → null). Resets the sidebar selection to `all`
 * when the deleted folder was selected.
 */
export async function deleteFolderAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  folderId: string,
): Promise<void> {
  await removeFolder(folderId)

  const state = get()
  set({
    folders: state.folders
      .filter((f) => f.id !== folderId)
      .map((f) => (f.parentId === folderId ? { ...f, parentId: null } : f)),
    previews: state.previews.map((p) =>
      p.folderId === folderId ? { ...p, folderId: null } : p,
    ),
    selectedFolder: state.selectedFolder === folderId ? 'all' : state.selectedFolder,
  })
}
