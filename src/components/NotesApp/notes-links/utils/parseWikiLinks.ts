/**
 * Extract the trimmed titles from every `[[Title]]` token in a markdown string.
 * Order-preserving; empty labels are skipped (duplicates are kept — callers
 * dedupe as needed).
 */
export function parseWikiLinks(content: string): string[] {
  if (!content) return []
  const re = /\[\[([^\]\n]+?)\]\]/g
  const labels: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    const label = match[1].trim()
    if (label) labels.push(label)
  }
  return labels
}
