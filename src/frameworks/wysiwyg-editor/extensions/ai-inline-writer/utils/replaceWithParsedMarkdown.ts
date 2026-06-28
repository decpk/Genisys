import type { Editor } from '@tiptap/react'

/**
 * Replace a plain-text range in the editor with properly parsed markdown content.
 * Uses tiptap-markdown's parser to convert markdown → HTML, then inserts as
 * rich content so code blocks, headings, lists, etc. render correctly.
 */
export function replaceWithParsedMarkdown(
  editor: Editor,
  from: number,
  to: number,
  markdown: string,
): void {
  const parser = (editor.storage as any).markdown?.parser
  if (!parser) return

  // parser.parse() returns an HTML string
  const html = parser.parse(markdown)
  if (!html) return

  // Delete the plain text range, then insert parsed HTML at that position
  editor
    .chain()
    .deleteRange({ from, to })
    .insertContentAt(from, html, { parseOptions: { preserveWhitespace: false } })
    .run()
}
