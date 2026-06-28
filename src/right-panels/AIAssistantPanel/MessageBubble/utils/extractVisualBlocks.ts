import type { VisualBlock } from '../MessageBubble.types'

// Matches a fenced ```mermaid or ```chart block, capturing the language and
// the inner body. The `g` flag drives repeated `exec` scans; `lastIndex` is
// reset before each scan so the function is safe to call repeatedly.
const VISUAL_FENCE_RE = /```(mermaid|chart)[ \t]*\r?\n([\s\S]*?)```/g

/**
 * Scan assistant message content for fenced ```mermaid / ```chart blocks and
 * return each as a self-contained, re-fenced markdown string (fences included)
 * suitable for inserting straight into a tiptap-markdown editor.
 */
export function extractVisualBlocks(content: string): VisualBlock[] {
  const blocks: VisualBlock[] = []
  VISUAL_FENCE_RE.lastIndex = 0

  let match: RegExpExecArray | null = VISUAL_FENCE_RE.exec(content)
  while (match !== null) {
    const kind = match[1] as VisualBlock['kind']
    const body = match[2].replace(/\s+$/, '')
    blocks.push({ kind, markdown: `\`\`\`${kind}\n${body}\n\`\`\`` })
    match = VISUAL_FENCE_RE.exec(content)
  }

  return blocks
}
