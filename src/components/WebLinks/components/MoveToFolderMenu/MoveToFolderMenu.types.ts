import type { PreviewFolder } from '@/components/WebLinks/WebLinks.types'

/** Props for the move-to-folder menu. */
export interface MoveToFolderMenuProps {
  /** Id of the saved preview being moved. */
  previewId: string
  /** Trigger element (rendered via `asChild`). */
  children: React.ReactNode
}

/** View-model returned by `useMoveToFolderMenuData`. */
export interface MoveToFolderMenuViewModel {
  /** All folders the preview can be moved into. */
  folders: PreviewFolder[]
  /** Move the preview to "Unfiled" (no folder). */
  onMoveToUnfiled: () => void
  /** Move the preview into a specific folder. */
  onMoveToFolder: (folderId: string) => void
}
