import type { Element, ElementContent, Text } from 'hast'

/** Child elements of a hast node, optionally filtered by tag name. */
export function childElements(node: Element, tag?: string): Element[] {
  return (node.children ?? []).filter(
    (child): child is Element =>
      child.type === 'element' && (tag === undefined || child.tagName === tag),
  )
}

/** First child element matching `tag`, if any. */
export function firstChild(node: Element, tag: string): Element | undefined {
  return childElements(node, tag)[0]
}

/** Concatenated text content of a hast node (deep). */
export function collectText(node: Element | ElementContent): string {
  if (node.type === 'text') return (node as Text).value
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => collectText(child as ElementContent)).join('')
  }
  return ''
}
