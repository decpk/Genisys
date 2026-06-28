//! Extract the raw text from an mdast paragraph node.
//!
//! We don't pull this in via `mdast-util-to-string` to keep the plugin
//! dependency-free; this hand-rolled version is enough because Source
//! paragraphs are short and contain only text + a single link.

interface MdastNode {
  type: string
  value?: string
  url?: string
  children?: MdastNode[]
}

/**
 * Flatten an mdast paragraph (or emphasis) into a plain string. Link
 * nodes are rendered back into `[label](url)` markdown form so the
 * downstream parser can find the URL.
 */
export function getParagraphText(node: MdastNode | null | undefined): string {
  if (!node) return ''
  if (node.type === 'text') return node.value ?? ''
  if (node.type === 'inlineCode') return `\`${node.value ?? ''}\``
  if (node.type === 'link') {
    const inner = (node.children ?? []).map(getParagraphText).join('')
    return `[${inner}](${node.url ?? ''})`
  }
  if (Array.isArray(node.children)) {
    return node.children.map(getParagraphText).join('')
  }
  return ''
}
