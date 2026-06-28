import type { BookLengthOption, ContentTypeOption } from './NewBookDialog.types'
import { extractTitleFromMarkdown as extractTitleFromMarkdownImpl } from './utils/extractTitleFromMarkdown'

export const BOOK_LENGTH_OPTIONS: BookLengthOption[] = [
  { value: 'micro', label: 'Micro', description: '2 chapters · ~1.5k words' },
  { value: 'one-pager', label: 'One Pager', description: '1 chapter · ~1k words' },
  { value: 'short', label: 'Short', description: '3–5 chapters' },
  { value: 'medium', label: 'Medium', description: '6–10 chapters' },
  { value: 'long', label: 'Long', description: '11–20 chapters' },
  { value: 'extended', label: 'Extended', description: '21–30 chapters' },
  { value: 'definitive', label: 'Definitive', description: '31–50 chapters' },
]

export const ARTICLE_LENGTH_OPTIONS: BookLengthOption[] = [
  { value: 'article-tldr', label: 'TL;DR', description: '~250–450 words' },
  { value: 'article-simple-short', label: 'Simple Short', description: '~500–800 words' },
  { value: 'article-simple-long', label: 'Simple Long', description: '~1,500–2,500 words' },
  { value: 'article-tutorial', label: 'Tutorial', description: '~2k–3.5k · step-by-step' },
  { value: 'article-in-depth', label: 'Long & In-Depth', description: '~3k–5k words' },
]

export const WEBPAGE_LENGTH_OPTIONS: BookLengthOption[] = [
  { value: 'webpage-match', label: 'Match Source', description: 'One chapter per page section' },
  { value: 'webpage-condensed', label: 'Condensed', description: '5–7 chapters · digest' },
  { value: 'webpage-expanded', label: 'Expanded', description: 'Per-section · extra depth' },
  { value: 'short', label: 'Short', description: '3–5 chapters' },
  { value: 'medium', label: 'Medium', description: '6–10 chapters' },
  { value: 'long', label: 'Long', description: '11–20 chapters' },
]

export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  { value: 'book', label: 'Book', description: 'Multi-chapter book' },
  { value: 'article', label: 'Article', description: 'Single article' },
]

export const DEFAULT_BOOK_LENGTH = 'medium' as const
export const DEFAULT_ARTICLE_LENGTH = 'article-simple-short' as const
export const DEFAULT_WEBPAGE_LENGTH = 'webpage-match' as const

export const DEFAULT_MODEL = 'claude-opus-4'

/**
 * Re-exported here to preserve the public path
 * `@/components/Library/NewBookDialog/NewBookDialog.constants#extractTitleFromMarkdown`
 * which is consumed by Chat and ProjectExplorer code paths.
 *
 * The implementation lives in `./utils/extractTitleFromMarkdown.ts` per the
 * one-function-per-file convention.
 */
export const extractTitleFromMarkdown = extractTitleFromMarkdownImpl
