export type SourceType = 'topic' | 'webpage'

export interface SourceTypePickerProps {
  value: SourceType
  onChange: (value: SourceType) => void
}

export interface SourceTypeOption {
  value: SourceType
  label: string
  description: string
}
