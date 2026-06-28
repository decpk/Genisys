/**
 * Returns the requested language if Shiki has loaded it; otherwise returns 'text'
 * which signals the caller to skip highlighting and use the plain fallback.
 */
export function resolveShikiLanguage(lang: string, supportedLangs: readonly string[]): string {
  if (supportedLangs.includes(lang)) return lang
  return 'text'
}
