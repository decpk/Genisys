import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS, type Language } from '@/lib/languages'

const STORAGE_KEY = 'genisys.lastBookLanguage'

const VALID_VALUES = new Set<string>(LANGUAGE_OPTIONS.map((o) => o.value))

export function loadLastBookLanguage(): Language {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && VALID_VALUES.has(raw)) return raw as Language
  } catch {
    // ignore
  }
  return DEFAULT_LANGUAGE
}

export function saveLastBookLanguage(language: Language): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // ignore
  }
}
