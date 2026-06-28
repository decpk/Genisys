import { LANGUAGE_OPTIONS, type Language } from '@/lib/languages'

export function getLanguageLabel(language: Language): string {
  return LANGUAGE_OPTIONS.find((opt) => opt.value === language)?.label ?? 'English'
}
