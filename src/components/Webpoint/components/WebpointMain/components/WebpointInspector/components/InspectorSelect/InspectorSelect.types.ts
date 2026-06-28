export interface InspectorSelectOption {
  label: string
  value: string
}

export interface InspectorSelectProps {
  label: string
  value: string
  options: InspectorSelectOption[]
  onChange: (value: string) => void
}
