import { Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import { MermaidBlockNodeView } from './MermaidBlockNodeView'
import { serializeFencedBlock } from '../diagram-blocks-shared/utils/serializeFencedBlock'
import { convertFenceToBlock } from '../diagram-blocks-shared/utils/convertFenceToBlock'

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    mermaidBlock: {
      /** Insert a live Mermaid diagram atom node with the given source. */
      setMermaidBlock: (attrs: { source: string }) => ReturnType
    }
  }
}

/**
 * `mermaidBlock` — an atom node that renders a Mermaid diagram LIVE inside the
 * WYSIWYG editor and round-trips to/from a ```mermaid fenced code block in the
 * stored note markdown (via the `tiptap-markdown` serialize/parse hooks below).
 */
export const MermaidBlock = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      source: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-source') ?? '',
        renderHTML: (attributes) => ({ 'data-source': attributes.source }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-mermaid-block]' }]
  },

  renderHTML(props) {
    const { HTMLAttributes } = props
    return ['div', mergeAttributes(HTMLAttributes, { 'data-mermaid-block': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlockNodeView)
  },

  addCommands() {
    return {
      setMermaidBlock:
        (attrs) =>
        (commandProps) =>
          commandProps.commands.insertContent({ type: this.name, attrs }),
    }
  },

  addStorage() {
    return {
      markdown: {
        serialize: serializeFencedBlock('mermaid'),
        parse: {
          updateDOM(element: HTMLElement) {
            convertFenceToBlock(element, 'mermaid', 'data-mermaid-block')
          },
        },
      },
    }
  },
})
