import type {
  PreviewFolderSelection,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'

/** Set the active sidebar selection driving the collection grid. */
export function selectFolderAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  selection: PreviewFolderSelection,
): void {
  set({ selectedFolder: selection })
}
