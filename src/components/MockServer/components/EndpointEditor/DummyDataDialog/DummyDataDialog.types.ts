export interface DummyDataDialogProps {
  /** Whether the modal is visible. */
  open: boolean
  /** Called when the modal requests an open-state change. */
  onOpenChange: (open: boolean) => void
  /** Called with the generated JSON string when the user confirms insertion. */
  onApply: (json: string) => void
}
