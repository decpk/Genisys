// ─── Chapter Highlight Extraction ────────────────────────────────
// Parses markdown content to extract navigable highlights.

export type HighlightType = 'section' | 'code' | 'mermaid' | 'important'

export interface ChapterHighlight {
  id: string
  type: HighlightType
  label: string
  /** Language for code highlights */
  lang?: string
  /** Section depth: 2 = ##, 3 = ### etc. Only for section type. */
  depth?: number
}

/** Display name for common code languages */
const LANG_DISPLAY: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'React TSX',
  jsx: 'React JSX',
  py: 'Python',
  python: 'Python',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Zsh',
  sql: 'SQL',
  rust: 'Rust',
  rs: 'Rust',
  go: 'Go',
  java: 'Java',
  kotlin: 'Kotlin',
  kt: 'Kotlin',
  swift: 'Swift',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  csharp: 'C#',
  cs: 'C#',
  ruby: 'Ruby',
  rb: 'Ruby',
  php: 'PHP',
  dart: 'Dart',
  r: 'R',
  lua: 'Lua',
  xml: 'XML',
  toml: 'TOML',
  markdown: 'Markdown',
  md: 'Markdown',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  nginx: 'Nginx',
  prisma: 'Prisma',
}

function getLangDisplayName(lang: string): string {
  return LANG_DISPLAY[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1)
}

/**
 * Unicode-aware slugify. Preserves letters/digits from any script
 * (e.g. Devanagari, Arabic, CJK), so non-Latin headings produce stable,
 * non-empty ids instead of collapsing to the same string.
 *
 * Backward-compatible for ASCII input: produces identical output to the
 * previous `[^\w\s-]` implementation for English text.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Build a unique `highlight-section-<slug>` id for a heading. Uses the
 * provided `seen` map to suffix duplicates with `-2`, `-3`, ... so multiple
 * headings with identical (or empty after slugify) text never collide.
 *
 * Pass the same `seen` map in document order to both highlight extraction
 * and DOM heading rendering so ids stay in lockstep.
 */
export function makeSectionId(text: string, seen: Map<string, number>): string {
  const base = slugify(text)
  const key = base || 'section'
  const count = (seen.get(key) ?? 0) + 1
  seen.set(key, count)
  return count === 1 ? `highlight-section-${key}` : `highlight-section-${key}-${count}`
}

/**
 * Extract highlights from chapter markdown content.
 * Returns an ordered list of navigable highlights.
 */
export function extractHighlights(content: string): ChapterHighlight[] {
  if (!content) return []

  const highlights: ChapterHighlight[] = []
  const lines = content.split('\n')
  const sectionSlugCounts = new Map<string, number>()
  let codeBlockIndex = 0
  let blockquoteIndex = 0
  let insideCodeBlock = false
  let currentCodeLang = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Track code blocks
    if (line.startsWith('```')) {
      if (!insideCodeBlock) {
        insideCodeBlock = true
        currentCodeLang = line.slice(3).trim().toLowerCase()

        if (currentCodeLang === 'mermaid') {
          highlights.push({
            id: `highlight-mermaid-${codeBlockIndex}`,
            type: 'mermaid',
            label: 'Mermaid Diagram',
            lang: 'mermaid',
          })
        } else if (currentCodeLang && currentCodeLang !== 'text') {
          highlights.push({
            id: `highlight-code-${codeBlockIndex}`,
            type: 'code',
            label: getLangDisplayName(currentCodeLang),
            lang: currentCodeLang,
          })
        }
        codeBlockIndex++
      } else {
        insideCodeBlock = false
        currentCodeLang = ''
      }
      continue
    }

    if (insideCodeBlock) continue

    // ## / ### headings → section highlights
    const headingMatch = line.match(/^(#{2,3})\s+(.+)/)
    if (headingMatch) {
      const depth = headingMatch[1].length
      const text = headingMatch[2].trim()
      if (text) {
        highlights.push({
          id: makeSectionId(text, sectionSlugCounts),
          type: 'section',
          label: text,
          depth,
        })
      }
      continue
    }

    // blockquotes → important highlights (skip quiz answer/explanation blockquotes)
    if (line.startsWith('> ')) {
      const text = line.replace(/^>\s+/, '').trim()
      if (/^\*\*(?:Answer|Explanation):\*\*/.test(text)) continue
      // Only add a highlight for meaningful blockquotes (not tiny ones)
      if (text.length > 20) {
        const prev = highlights[highlights.length - 1]
        // Avoid consecutive important highlights from multi-line blockquotes
        if (prev?.type !== 'important') {
          highlights.push({
            id: `highlight-important-${blockquoteIndex}`,
            type: 'important',
            label: text,
          })
          blockquoteIndex++
        }
      }
    }
  }

  return highlights
}
