import type { PreviewFolder } from '@/components/WebLinks/WebLinks.types'

/** Props for the create-folder dialog. */
export interface NewFolderDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** Controlled open-change handler. */
  onOpenChange: (open: boolean) => void
  /**
   * Optional callback invoked with the newly created folder after a successful
   * create. Used by `SaveToCollectionMenu` to save the current preview straight
   * into the folder the user just made.
   */
  onCreated?: (folder: PreviewFolder) => void
}

/** View-model returned by `useNewFolderDialogData`. */
export interface NewFolderDialogViewModel {
  /** Current name input value. */
  name: string
  /** Currently selected accent color (hex). */
  color: string
  /** Available color presets. */
  colorPresets: readonly string[]
  /** Whether the form can be submitted (non-empty name). */
  canSubmit: boolean
  /** Name input change handler. */
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Select an accent color. */
  onSelectColor: (color: string) => void
  /** Submit handler — creates the folder, closes, then fires `onCreated`. */
  onSubmit: (event: React.FormEvent) => void
}
