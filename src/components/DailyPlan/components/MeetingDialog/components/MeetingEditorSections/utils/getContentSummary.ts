export function getContentSummary(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) return 'Empty'
  const lines = trimmed.split('\n').filter((line) => line.trim().length > 0)
  if (lines.length === 1) return '1 line'
  return `${lines.length} lines`
}
