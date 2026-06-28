import { parseEntityToken } from '@/ai/entity-links'

const CITATION_REGEX = /\[\[file:(.*?)(?:#L(\d+)(?:-L(\d+))?)?\]\]/g

export function parseCitations(text: string): string {
  const withFileCitations = text.replace(CITATION_REGEX, (_match, filePath: string, startLine?: string, endLine?: string) => {
    const name = filePath.split('/').pop() ?? filePath
    const label = startLine
      ? endLine
        ? `${name} L${startLine}–${endLine}`
        : `${name} L${startLine}`
      : name
    const params = [encodeURIComponent(filePath)]
    if (startLine) params.push(startLine)
    if (endLine) params.push(endLine)
    return `[${label}](#cite:${params.join(':')})`
  })
  return parseEntityToken(withFileCitations)
}
