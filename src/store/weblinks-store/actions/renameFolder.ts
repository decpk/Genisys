import type {
  WebLinksStoreActions,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'
import { saveFolder } from '@/components/WebLinks/api/saveFolder'

/** Rename a folder, persist the change, and update the store. */
export async function renameFolderAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  folderId: string,
  name: string,
): Promise<void> {
  const folders = get().folders
  const target = folders.find((f) => f.id === folderId)
  if (!target) return

  const updated = { ...target, name: name.trim() || target.name }
  await saveFolder(updated)
  set({ folders: folders.map((f) => (f.id === folderId ? updated : f)) })
}
