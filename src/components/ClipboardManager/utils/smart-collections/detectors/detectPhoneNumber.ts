const PHONE_PATTERN = /(\+?\d{1,4}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/
const PURE_DIGITS = /^\d+$/

export function detectPhoneNumber(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length > 30) return false
  if (PURE_DIGITS.test(trimmed) && trimmed.length < 7) return false
  return PHONE_PATTERN.test(trimmed)
}
