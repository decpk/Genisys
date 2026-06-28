//! Remark plugin: glue an italic `*Source: ...*` paragraph that follows an
//! image into the image's data attributes, then remove the paragraph.
//!
//! This lets the AI write natural markdown:
//!
//!     ![Caption](https://example.com/photo.jpg)
//!
//!     *Source: Wikimedia Commons — [commons.wikimedia.org](https://example.com/photo.jpg)*
//!
//! ...while the renderer shows a single image with a built-in source pill
//! (no duplicate paragraph below it).

import { attachSourceToImage } from './attachSourceToImage'
import { detectSourceParagraph } from './detectSourceParagraph'
import { parseImageSourceText } from './parseImageSourceText'

interface MdastNode {
  type: string
  children?: MdastNode[]
}

interface MdastParent extends MdastNode {
  children: MdastNode[]
}

/**
 * Returns the standalone image node inside a paragraph (or the paragraph
 * itself if it _is_ an image node). Markdown like `![alt](url)` is parsed
 * as `paragraph > image`, so we have to unwrap.
 */
function findImageChild(node: MdastNode): MdastNode | null {
  if (node.type === 'image') return node
  if (node.type !== 'paragraph') return null
  const kids = (node as MdastParent).children ?? []
  if (kids.length !== 1) return null
  return kids[0].type === 'image' ? kids[0] : null
}

/**
 * Remark transformer. Walks the AST once, looking for `paragraph[image]`
 * followed immediately by an italic `*Source: ...*` paragraph. When found:
 *   1. Parses the source line into { label, domain, url }.
 *   2. Attaches those as `data-*` props on the image node.
 *   3. Removes the source paragraph from the tree.
 */
export function remarkImageSource() {
  return (tree: MdastNode) => {
    const root = tree as MdastParent
    if (!Array.isArray(root.children)) return

    walk(root)
  }
}

function walk(parent: MdastParent): void {
  const out: MdastNode[] = []
  for (let i = 0; i < parent.children.length; i += 1) {
    const current = parent.children[i]
    out.push(current)

    // Recurse into containers (lists, blockquotes, etc.)
    if (Array.isArray((current as MdastParent).children) && current.type !== 'paragraph') {
      walk(current as MdastParent)
    }

    const image = findImageChild(current)
    if (!image) continue

    const next = parent.children[i + 1]
    const sourceText = detectSourceParagraph(next)
    if (!sourceText) continue

    const parsed = parseImageSourceText(sourceText)
    attachSourceToImage(image, parsed)

    // Skip the source paragraph — it's now baked into the image.
    i += 1
  }
  parent.children = out
}
