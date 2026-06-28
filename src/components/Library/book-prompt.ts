export type BookLength =
  // Book lengths
  | 'micro'
  | 'one-pager'
  | 'short'
  | 'medium'
  | 'long'
  | 'extended'
  | 'definitive'
  // Article lengths
  | 'article-tldr'
  | 'article-simple-short'
  | 'article-simple-long'
  | 'article-tutorial'
  | 'article-in-depth'
  // Webpage-driven lengths (chapter count derived from source)
  | 'webpage-match'
  | 'webpage-condensed'
  | 'webpage-expanded'

export function isArticleLength(length: BookLength): boolean {
  return length.startsWith('article-')
}

export function isWebpageLength(length: BookLength): boolean {
  return length.startsWith('webpage-')
}

/**
 * Source material for prompts that build a book/article from a webpage.
 * `content` is plain text that has already been extracted and (typically) truncated.
 */
export interface WebpageSource {
  url: string
  title?: string
  description?: string
  content: string
}

const SOURCE_BLOCK_HEADER = '────────────────────────────────────────────────────────────\nSOURCE MATERIAL (use this exact content as the basis for the book)\n────────────────────────────────────────────────────────────'

export function buildSourceBlock(source: WebpageSource): string {
  const titleLine = source.title ? `Source Title: ${source.title}\n` : ''
  const descLine = source.description ? `Source Description: ${source.description}\n` : ''
  return `${SOURCE_BLOCK_HEADER}

Source URL: ${source.url}
${titleLine}${descLine}
--- BEGIN SOURCE CONTENT ---
${source.content}
--- END SOURCE CONTENT ---

SEQUENCE-PRESERVING RULES (MANDATORY when source is provided):
- The chapter order MUST mirror the natural top-to-bottom flow of the source above.
- Use the source's own section headings as the spine of your TOC.
- Do NOT reorder, invent, or shuffle sections relative to the source.
- You may expand, clarify, or add depth to a section, but you may not move it earlier or later in the book.
- Each chapter SHOULD reference the originating section in its Overview (e.g., "This chapter expands the source's '<Section Title>' section.").
- Do NOT include sections that are clearly navigation, footers, ads, related-links, or boilerplate.
`
}
