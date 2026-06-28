export function extractTitleFromMarkdown(md: string): string {
  const match = md.match(/^#{1,2}\s+(.+)$/m)
  return match ? match[1].trim() : 'Untitled Book'
}
