/** Props for the shared raw-source editor used by diagram/chart atom nodes. */
export interface BlockSourceEditorProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
}
