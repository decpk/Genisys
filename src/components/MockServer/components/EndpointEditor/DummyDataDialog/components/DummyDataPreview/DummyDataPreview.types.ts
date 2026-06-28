export interface DummyDataPreviewProps {
  /** Pretty-printed JSON preview to display. */
  json: string
  /** Called when the user requests a fresh random sample. */
  onRegenerate: () => void
}
