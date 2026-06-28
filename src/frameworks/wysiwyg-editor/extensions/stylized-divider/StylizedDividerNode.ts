import { Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'

import { StylizedDividerNodeView } from './StylizedDividerNodeView'

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    stylizedDivider: {
      /** Insert a stylized (gold gradient + diamond glyph) divider at the cursor. */
      setStylizedDivider: () => ReturnType
    }
  }
}

/**
 * Block-level Tiptap node that renders a stylized divider matching the AI
 * Assistant's between-message separator (gold gradient with a centered
 * diamond glyph).
 *
 * Persistence: serialized as `<div data-stylized-divider></div>`, which is
 * block-level raw HTML and round-trips cleanly through `tiptap-markdown` /
 * `markdown-it` without needing a custom markdown serializer.
 */
export const StylizedDivider = Node.create({
  name: 'stylizedDivider',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  parseHTML() {
    return [{ tag: 'div[data-stylized-divider]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-stylized-divider': '' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(StylizedDividerNodeView)
  },

  addCommands() {
    return {
      setStylizedDivider:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name }),
    }
  },
})
