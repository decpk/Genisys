import type { ChangeEvent, FormEvent } from 'react'

/** Props for the quick-add link dialog. */
export interface AddLinkDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** Controlled open-change handler. */
  onOpenChange: (open: boolean) => void
}

/** View-model returned by `useAddLinkDialogData`, consumed by the `AddLinkDialog` view. */
export interface AddLinkDialogViewModel {
  /** Current URL input value. */
  inputValue: string
  /** Whether a save is currently in flight. */
  isAdding: boolean
  /** Whether the current input is a submittable URL. */
  canSubmit: boolean
  /** URL input change handler. */
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  /** Submit handler: fetch the link metadata, save it, then close on success. */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}
