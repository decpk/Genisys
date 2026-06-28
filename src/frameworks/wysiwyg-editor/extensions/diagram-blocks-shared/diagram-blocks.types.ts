/**
 * Shared type declarations for the live diagram/chart atom blocks
 * (`mermaidBlock`, `chartBlock`). Declaration-only — no runtime code.
 */

/** Minimal shape of a ProseMirror node carrying a diagram `source` attribute. */
export interface DiagramBlockNode {
  attrs: { source?: string }
}

/**
 * Minimal structural subset of `tiptap-markdown`'s `MarkdownSerializerState`
 * (which extends `prosemirror-markdown`'s) — only the methods our fenced-block
 * serializer touches. Kept local to avoid a hard dependency on the transitive
 * `prosemirror-markdown` types.
 */
export interface MarkdownSerializeState {
  write(content: string): void
  text(text: string, escape?: boolean): void
  ensureNewLine(): void
  closeBlock(node: DiagramBlockNode): void
}
