import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const selectionHighlightKey = new PluginKey('selectionHighlight')

/**
 * Adds a visible background decoration across multi-block selections
 * (e.g. Cmd+A) where the browser's native ::selection may not render.
 */
export const SelectionHighlight = Extension.create({
  name: 'selectionHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: selectionHighlightKey,
        props: {
          decorations(state) {
            const { from, to } = state.selection
            if (to - from <= 0) return DecorationSet.empty

            // Only apply when selection spans more than one block node
            const $from = state.doc.resolve(from)
            const $to = state.doc.resolve(to)
            if ($from.parent === $to.parent && $from.depth === $to.depth) {
              return DecorationSet.empty
            }

            return DecorationSet.create(state.doc, [
              Decoration.inline(from, to, { class: 'prosemirror-selection-highlight' }),
            ])
          },
        },
      }),
    ]
  },
})
