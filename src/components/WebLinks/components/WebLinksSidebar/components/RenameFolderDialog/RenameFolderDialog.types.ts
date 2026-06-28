import type { PreviewFolder } from '@/components/WebLinks/WebLinks.types'

/** Props for the rename-folder dialog. */
export interface RenameFolderDialogProps {
  /** Folder being renamed. */
  folder: PreviewFolder
  /** Whether the dialog is open. */
  open: boolean
  /** Controlled open-change handler. */
  onOpenChange: (open: boolean) => void
}

/** View-model returned by `useRenameFolderDialogData`. */
export interface RenameFolderDialogViewModel {
  /** Current name input value. */
  name: string
  /** Whether the form can be submitted (non-empty name). */
  canSubmit: boolean
  /** Name input change handler. */
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Submit handler — renames the folder then closes. */
  onSubmit: (event: React.FormEvent) => void
}
