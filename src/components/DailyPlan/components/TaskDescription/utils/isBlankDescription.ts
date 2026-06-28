export function isBlankDescription(content: string | null | undefined): boolean {
  if (!content) return true
  return content.trim().length === 0
}
