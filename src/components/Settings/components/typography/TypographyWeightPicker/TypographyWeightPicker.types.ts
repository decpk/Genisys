import type { CodeFontWeight } from '@/store/settings-store'

export interface TypographyWeightPickerProps {
  value: CodeFontWeight
  onChange: (next: CodeFontWeight) => void
}

export interface WeightOption {
  value: CodeFontWeight
  label: string
}
