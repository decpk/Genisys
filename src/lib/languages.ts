// Shared language constants used by Settings (Explain Language) and
// Library (Book/Article generation language). One source of truth.

export type Language =
  | 'english'
  | 'hindi'
  | 'hinglish'
  | 'spanish'
  | 'french'
  | 'german'
  | 'japanese'
  | 'chinese'
  | 'korean'
  | 'arabic'
  | 'portuguese'
  | 'russian'
  | 'italian'
  | 'dutch'
  | 'turkish'
  | 'bengali'

export interface LanguageOption {
  value: Language
  label: string
}

export const LANGUAGE_OPTIONS: ReadonlyArray<LanguageOption> = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'हिन्दी (Hindi)' },
  { value: 'hinglish', label: 'Hinglish (Hindi + English)' },
  { value: 'spanish', label: 'Español (Spanish)' },
  { value: 'french', label: 'Français (French)' },
  { value: 'german', label: 'Deutsch (German)' },
  { value: 'japanese', label: '日本語 (Japanese)' },
  { value: 'chinese', label: '中文 (Chinese)' },
  { value: 'korean', label: '한국어 (Korean)' },
  { value: 'arabic', label: 'العربية (Arabic)' },
  { value: 'portuguese', label: 'Português (Portuguese)' },
  { value: 'russian', label: 'Русский (Russian)' },
  { value: 'italian', label: 'Italiano (Italian)' },
  { value: 'dutch', label: 'Nederlands (Dutch)' },
  { value: 'turkish', label: 'Türkçe (Turkish)' },
  { value: 'bengali', label: 'বাংলা (Bengali)' },
] as const

export const DEFAULT_LANGUAGE: Language = 'english'
