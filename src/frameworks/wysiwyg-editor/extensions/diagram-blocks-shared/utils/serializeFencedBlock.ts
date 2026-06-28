import type {
  DiagramBlockNode,
  MarkdownSerializeState,
} from '../diagram-blocks.types'

/**
 * Build a `tiptap-markdown` node serializer that writes a diagram atom node
 * back out as a fenced code block with the given language, e.g.:
 *
 * ```mermaid
 * <source>
 * ```
 *
 * This is the serialize half of the markdown round-trip — it mirrors the
 * shape `tiptap-markdown`'s built-in `codeBlock` serializer produces so the
 * saved note markdown (and the AI panel) see an ordinary fenced block.
 */
export function serializeFencedBlock(language: string) {
  return function serialize(
    state: MarkdownSerializeState,
    node: DiagramBlockNode,
  ): void {
    const source = node.attrs.source ?? ''
    state.write('```' + language + '\n')
    state.text(source, false)
    state.ensureNewLine()
    state.write('```')
    state.closeBlock(node)
  }
}
