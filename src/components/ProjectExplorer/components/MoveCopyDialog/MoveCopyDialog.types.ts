export type MoveCopyMode = 'move' | 'copy'

export interface MoveCopyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: MoveCopyMode
  itemPath: string
  isFolder: boolean
  rootPath: string
  onConfirm: (destinationFolder: string) => Promise<void>
}
