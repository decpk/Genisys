const DOCTYPE_OR_HTML_TAG = /<!DOCTYPE\s+html|<html[\s>]/i
const TAG_PATTERN = /<([a-z][a-z0-9]*)\b[^>]*>[\s\S]*<\/\1>/i
const JS_EXPR = /=>|\bconst\s+\w+\s*=|\bfunction\s+\w+\s*\(|\blet\s+\w+\s*=|\bvar\s+\w+\s*=/

export function isHtml(text: string): boolean {
  if (JS_EXPR.test(text)) return false
  if (DOCTYPE_OR_HTML_TAG.test(text)) return true
  return TAG_PATTERN.test(text)
}
