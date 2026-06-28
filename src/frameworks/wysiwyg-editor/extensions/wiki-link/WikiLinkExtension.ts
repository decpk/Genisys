import { Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import type { Editor, Range } from '@tiptap/react'

import { WikiLinkChip } from './components/WikiLinkChip'
import { wikiLinkSuggestionRender } from './wikiLinkSuggestionRender'
import { buildWikiLinkItems } from './utils/buildWikiLinkItems'
import { insertWikiLinkCommand } from './utils/insertWikiLinkCommand'
import { serializeWikiLink } from './utils/serializeWikiLink'
import { convertWikiLinkText } from './utils/convertWikiLinkText'
import type {
  WikiLinkMenuItem,
  WikiLinkOptions,
} from './WikiLinkExtension.types'

export const WikiLinkPluginKey = new PluginKey('wikiLink')

/**
 * `wikiLink` — an inline atom node enabling Obsidian-style `[[Title]]` links
 * between documents. The node is generic: navigation, title resolution, search
 * and note creation are injected by the consumer via `.configure(...)`.
 *
 * Round-trips to/from a `[[Title]]` token in stored markdown through the
 * `markdown` storage hooks below (serialize + parse.updateDOM).
 */
export const WikiLink = Node.create<WikiLinkOptions>({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return {
      search: () => [],
      resolveByTitle: () => null,
      navigate: () => {},
      createNote: async () => '',
    }
  },

  addAttributes() {
    return {
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) return {}
          return { 'data-label': attributes.label }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: `span[data-type="${this.name}"]` }]
  },

  renderHTML(props) {
    const { node, HTMLAttributes } = props
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': this.name,
        class: 'wiki-link-chip',
      }),
      `[[${node.attrs.label ?? ''}]]`,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(WikiLinkChip, { as: 'span' })
  },

  addProseMirrorPlugins() {
    const options = this.options
    return [
      Suggestion<WikiLinkMenuItem>({
        editor: this.editor,
        char: '[[',
        pluginKey: WikiLinkPluginKey,
        allowSpaces: true,
        startOfLine: false,
        items: ({ query }) => buildWikiLinkItems(query, options.search),
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: WikiLinkMenuItem
        }) => insertWikiLinkCommand(editor, range, props, options),
        render: wikiLinkSuggestionRender,
      }),
    ]
  },

  addStorage() {
    return {
      markdown: {
        serialize: serializeWikiLink,
        parse: {
          updateDOM(element: HTMLElement) {
            convertWikiLinkText(element)
          },
        },
      },
    }
  },
})
