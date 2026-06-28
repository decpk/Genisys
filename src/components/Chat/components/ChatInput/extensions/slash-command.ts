import { Mention } from '@tiptap/extension-mention'
import { PluginKey } from '@tiptap/pm/state'

export const SlashCommandPluginKey = new PluginKey('slashCommand')

export const SlashCommand = Mention.extend({
  name: 'slashCommand',

  addOptions() {
    return {
      ...this.parent?.(),
      suggestion: {
        ...this.parent?.().suggestion,
        char: '/',
        pluginKey: SlashCommandPluginKey,
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
              { type: 'slashCommand', attrs: props },
              { type: 'text', text: ' ' },
            ])
            .run()
          window.getSelection()?.collapseToEnd()
        },
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
        class: 'slash-command-chip',
      },
      `/${node.attrs.label ?? node.attrs.id}`,
    ]
  },

  parseHTML() {
    return [{ tag: `span[data-type="${this.name}"]` }]
  },
})
