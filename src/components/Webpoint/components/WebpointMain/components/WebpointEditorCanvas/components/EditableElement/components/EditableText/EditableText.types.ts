export interface EditableTextProps {
  initial: string
  onCommit: (content: string) => void
}
