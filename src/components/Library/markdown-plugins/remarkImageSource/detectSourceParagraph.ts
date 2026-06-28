//! Detect whether an mdast paragraph is a fully-italic `*Source: ...*` line.
//!
//! Returns the raw text content of the emphasis node (without the wrapping
//! asterisks) when matched, or `null` otherwise. We require:
//!
//!   1. The paragraph contains exactly one child.
//!   2. That child is an emphasis node (italic in source markdown).
//!   3. The text inside begins with `Source:` (case-insensitive).

import { getParagraphText } from './getParagraphText'

interface MdastNode {
  type: string
  value?: string
  url?: string
  children?: MdastNode[]
}

/**
 * If `node` is an italicized "Source: ..." paragraph, return the inner
 * text. Otherwise return `null`.
 */
export function detectSourceParagraph(node: MdastNode | null | undefined): string | null {
  if (!node || node.type !== 'paragraph') return null
  const children = node.children ?? []
  if (children.length !== 1) return null

  const only = children[0]
  if (only.type !== 'emphasis') return null

  const text = getParagraphText(only)
  if (!/^\s*source\s*:/i.test(text)) return null
  return text
}
