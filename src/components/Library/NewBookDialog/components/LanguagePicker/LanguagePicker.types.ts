import type { Language } from '@/lib/languages'

export interface LanguagePickerProps {
  value: Language
  onChange: (language: Language) => void
}
