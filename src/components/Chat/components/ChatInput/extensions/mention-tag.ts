import { Mention } from '@tiptap/extension-mention'
import { PluginKey } from '@tiptap/pm/state'

const MentionTagPluginKey = new PluginKey('mentionTag')

export const MentionTag = Mention.extend({
  name: 'mentionTag',

  addOptions() {
    return {
      ...this.parent?.(),
      suggestion: {
        ...this.parent?.().suggestion,
        char: '@',
        pluginKey: MentionTagPluginKey,
        allowSpaces: false,
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          const nodeAfter = editor.view.state.selection.$to.nodeAfter
          const overrideSpace = nodeAfter?.text?.startsWith(' ')
          if (overrideSpace) {
            range.to += 1
          }
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: 'mentionTag', attrs: props },
              { type: 'text', text: ' ' },
            ])
            .run()
          window.getSelection()?.collapseToEnd()
        },
        items: ({ query }: { query: string }) => {
          return query.length > 0 ? [{ id: query, label: query }] : []
        },
        render: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onExit: () => {},
          onKeyDown: () => false,
        }),
      },
    }
  },

  addAttributes() {
    return {
      id: { default: null, parseHTML: (el: Element) => el.getAttribute('data-id') },
      label: { default: null, parseHTML: (el: Element) => el.getAttribute('data-label') },
    }
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-type': this.name,
        'data-id': node.attrs.id,
        'data-label': node.attrs.label,
        class: 'mention-chip',
      },
      `@${node.attrs.label ?? node.attrs.id}`,
    ]
  },

  parseHTML() {
    return [{ tag: `span[data-type="${this.name}"]` }]
  },
})
