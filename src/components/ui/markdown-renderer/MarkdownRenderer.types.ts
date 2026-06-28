export type MarkdownVariant = 'default' | 'compact' | 'research'

export interface CitationClickInfo {
  filePath: string
  name: string
  sourceType: 'file'
  startLine?: number
  endLine?: number
}

export type CitationClickHandler = (info: CitationClickInfo) => void

export interface MarkdownRendererProps {
  content: string
  variant?: MarkdownVariant
  enableCitations?: boolean
  onCitationClick?: CitationClickHandler
  isStreaming?: boolean
  className?: string
}
