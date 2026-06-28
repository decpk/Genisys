import type { Node as PMNode } from '@tiptap/pm/model'

interface MarkdownSerializerState {
  write: (text: string) => void
}

/**
 * Markdown serializer for the `wikiLink` node — round-trips to the
 * Obsidian-style `[[Title]]` token in the stored note markdown.
 */
export function serializeWikiLink(
  state: MarkdownSerializerState,
  node: PMNode,
): void {
  const label = (node.attrs.label as string | null) ?? ''
  state.write(`[[${label}]]`)
}
