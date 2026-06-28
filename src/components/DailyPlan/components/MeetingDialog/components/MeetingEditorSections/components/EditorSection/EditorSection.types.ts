export interface EditorSectionProps {
  label: string
  placeholder: string
  value: string
  onChange: (markdown: string) => void
  defaultExpanded: boolean
}
