import mermaid from 'mermaid'

import { MERMAID_FONT_FAMILY, MERMAID_FONT_SIZE, ZOOM_LIMITS } from './MermaidViewer.constants'

let mermaidIdCounter = 0

export function getThemeVariables(): Record<string, string> {
  const style = getComputedStyle(document.documentElement)
  const v = (name: string): string => style.getPropertyValue(`--color-${name}`).trim()

  const bg = v('background') || 'hsl(0 0% 100%)'
  const fg = v('foreground') || 'hsl(0 0% 0%)'
  const card = v('card') || bg
  const border = v('border') || 'hsl(0 0% 80%)'
  const muted = v('muted') || card
  const mutedFg = v('muted-foreground') || fg
  const info = v('info') || v('primary') || 'hsl(212 70% 50%)'

  return {
    primaryColor: info,
    primaryTextColor: fg,
    primaryBorderColor: border,
    secondaryColor: card,
    tertiaryColor: bg,
    lineColor: mutedFg,
    textColor: fg,
    mainBkg: bg,
    nodeBorder: info,
    clusterBkg: muted,
    clusterBorder: border,
    titleColor: fg,
    edgeLabelBackground: bg,
    nodeTextColor: fg,
  }
}

export function generateMermaidId(): string {
  return `mermaid-${Date.now()}-${mermaidIdCounter++}`
}

export function initializeMermaid(isDark: boolean): void {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    fontFamily: MERMAID_FONT_FAMILY,
    fontSize: MERMAID_FONT_SIZE,
    darkMode: isDark,
    themeVariables: getThemeVariables(),
  })
}

/**
 * Wraps node text in double quotes when it contains characters that
 * Mermaid's parser would otherwise treat as syntax tokens.
 *
 * Handles these node shapes:
 *   ID[text]  ID(text)  ID{text}  ID([text])  ID[[text]]  ID[(text)]
 *   ID((text))  ID{{text}}
 *
 * Note: the `ID>text]` (asymmetric) shape is intentionally NOT matched
 * because `>` collides with edge arrows like `-->`.
 */
export function sanitizeMermaidCode(chart: string): string {
  // Characters that cause parse ambiguity inside node text
  // eslint-disable-next-line no-useless-escape
  const needsQuoting = /[(){}\[\]:;|<>#→←↔]/

  // A preceding boundary prevents matching IDs mid-arrow (e.g. `-->B[...]`)
  // where `--` could otherwise be read as part of an ID.
  const boundary = '(^|[\\s;&])'
  const idPart = '([A-Za-z_][A-Za-z0-9_-]*)'

  // Each entry has: open literal, close literal, and a text-character class
  // that prevents the regex from crossing a matching-bracket boundary.
  // Double-bracket shapes MUST run before single-bracket shapes so that e.g.
  // `ID[[text]]` isn't mis-parsed as `ID[[text]` + stray `]`.
  const shapes: Array<{ open: string; close: string; textClass: string }> = [
    // Double / compound shapes
    { open: '\\(\\[', close: '\\]\\)', textClass: '.*?' },
    { open: '\\[\\[', close: '\\]\\]', textClass: '.*?' },
    { open: '\\[\\(', close: '\\)\\]', textClass: '.*?' },
    { open: '\\(\\(', close: '\\)\\)', textClass: '.*?' },
    { open: '\\{\\{', close: '\\}\\}', textClass: '.*?' },
    // Single-bracket shapes — text cannot contain the matching brackets
    // (to prevent crossing node boundaries). Quotes are allowed so we can
    // correctly skip already-quoted nodes via the startsWith('"') check.
    { open: '\\[', close: '\\]', textClass: '[^\\[\\]]*?' },
    { open: '\\(', close: '\\)', textClass: '[^()]*?' },
    { open: '\\{', close: '\\}', textClass: '[^{}]*?' },
  ]

  let result = chart
  for (const { open, close, textClass } of shapes) {
    const re = new RegExp(`${boundary}${idPart}(${open})(${textClass})(${close})`, 'g')
    result = result.replace(re, (_m, pre, id, openLit, text, closeLit) => {
      if (text.startsWith('"') || !needsQuoting.test(text)) {
        return `${pre}${id}${openLit}${text}${closeLit}`
      }
      const escaped = text.replace(/"/g, '#quot;')
      return `${pre}${id}${openLit}"${escaped}"${closeLit}`
    })
  }
  return result
}

// Characters that break Mermaid's mindmap parser when they appear in raw
// (unquoted) node text — most notably parentheses/brackets, which the parser
// reads as node-shape markers even inside double quotes.
// eslint-disable-next-line no-useless-escape
const MINDMAP_NEEDS_QUOTING = /[(){}\[\]<>&|;#→←↔]/

/** Escapes characters that can't live literally inside a `["..."]` mindmap label. */
function escapeMindmapLabel(text: string): string {
  return text
    .replace(/"/g, '#quot;')
    .replace(/\[/g, '#91;')
    .replace(/\]/g, '#93;')
}

/** Quotes the inner text of an explicit mindmap shape only when required. */
function quoteMindmapShapeText(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return text
  if (!MINDMAP_NEEDS_QUOTING.test(trimmed)) return text
  return `"${escapeMindmapLabel(trimmed)}"`
}

// Explicit mindmap node shapes, ordered so compound shapes match before their
// single-character counterparts (e.g. `((circle))` before `(rounded)`).
const MINDMAP_SHAPES: Array<{ re: RegExp; wrap: (id: string, text: string) => string }> = [
  { re: /^([\w-]*)\(\(([\s\S]*)\)\)$/, wrap: (id, t) => `${id}((${quoteMindmapShapeText(t)}))` },
  { re: /^([\w-]*)\)\)([\s\S]*)\(\($/, wrap: (id, t) => `${id}))${quoteMindmapShapeText(t)}((` },
  { re: /^([\w-]*)\{\{([\s\S]*)\}\}$/, wrap: (id, t) => `${id}{{${quoteMindmapShapeText(t)}}}` },
  { re: /^([\w-]*)\)([\s\S]*)\($/, wrap: (id, t) => `${id})${quoteMindmapShapeText(t)}(` },
  { re: /^([\w-]*)\(([\s\S]*)\)$/, wrap: (id, t) => `${id}(${quoteMindmapShapeText(t)})` },
  { re: /^([\w-]*)\[([\s\S]*)\]$/, wrap: (id, t) => `${id}[${quoteMindmapShapeText(t)}]` },
]

/** Sanitizes a single mindmap node's content (indentation already stripped). */
function sanitizeMindmapNode(content: string): string {
  for (const { re, wrap } of MINDMAP_SHAPES) {
    const match = content.match(re)
    if (match) return wrap(match[1], match[2])
  }

  // Plain text node (optionally wrapped in quotes). Only rewrite when it
  // contains characters the parser would otherwise choke on.
  let inner = content
  if (inner.startsWith('"') && inner.endsWith('"') && inner.length >= 2) {
    inner = inner.slice(1, -1)
  }
  if (!MINDMAP_NEEDS_QUOTING.test(inner)) return content
  return `["${escapeMindmapLabel(inner)}"]`
}

/**
 * Sanitizes a Mermaid `mindmap` diagram. Node text in mindmaps cannot contain
 * raw parentheses/brackets — the parser treats them as shape markers even when
 * quoted — so this wraps offending labels in an escaped square-bracket shape.
 */
export function sanitizeMindmapCode(chart: string): string {
  const lines = chart.split('\n')
  const out: string[] = []
  let seenMindmap = false

  for (const line of lines) {
    const trimmedStart = line.trimStart()
    const indent = line.slice(0, line.length - trimmedStart.length)
    const content = trimmedStart.trimEnd()

    if (!seenMindmap) {
      out.push(line)
      if (/^mindmap\b/.test(content)) seenMindmap = true
      continue
    }

    // Preserve blank lines, comments, icon/class decorators untouched.
    if (content === '' || content.startsWith('%%') || content.startsWith(':::') || content.startsWith('::icon')) {
      out.push(line)
      continue
    }

    out.push(indent + sanitizeMindmapNode(content))
  }

  return out.join('\n')
}

/** Detects whether a chart is a mindmap, skipping comments and frontmatter. */
function isMindmapChart(chart: string): boolean {
  let inFrontmatter = false
  for (const raw of chart.split('\n')) {
    const line = raw.trim()
    if (line === '') continue
    if (line === '---') {
      inFrontmatter = !inFrontmatter
      continue
    }
    if (inFrontmatter || line.startsWith('%%')) continue
    return /^mindmap\b/.test(line)
  }
  return false
}

export async function renderMermaidChart(chart: string): Promise<string> {
  const id = generateMermaidId()
  const trimmed = chart.trim()
  const sanitized = isMindmapChart(trimmed)
    ? sanitizeMindmapCode(trimmed)
    : sanitizeMermaidCode(trimmed)
  const { svg } = await mermaid.render(id, sanitized)
  return svg.replace('<svg ', '<svg style="max-width:100%;height:auto;" ')
}

export function clampScale(value: number): number {
  return Math.min(Math.max(ZOOM_LIMITS.min, value), ZOOM_LIMITS.max)
}

export function formatTranslate(x: number, y: number): string {
  if (x === 0 && y === 0) return 'origin'
  const fx = `${x > 0 ? '+' : ''}${Math.round(x)}`
  const fy = `${y > 0 ? '+' : ''}${Math.round(y)}`
  return `${fx}, ${fy}`
}
