const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

export function detectEmail(text: string): boolean {
  return EMAIL_PATTERN.test(text)
}
