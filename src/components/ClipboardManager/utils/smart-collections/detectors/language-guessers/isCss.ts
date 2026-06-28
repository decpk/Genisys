const CSS_PATTERN = /[#.\w][-\w,\s>:.()[\]]*\{[^{}]*[a-z-]+\s*:\s*[^;{}]+;[^{}]*\}/i
const JSON_LIKE = /^\s*\{/
const JS_KEYWORDS = /\b(function|const|let|var|=>|return|import|export)\b/

export function isCss(text: string): boolean {
  if (JSON_LIKE.test(text)) return false
  if (JS_KEYWORDS.test(text)) return false
  return CSS_PATTERN.test(text)
}
