import { Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import { ChartBlockNodeView } from './ChartBlockNodeView'
import { serializeFencedBlock } from '../diagram-blocks-shared/utils/serializeFencedBlock'
import { convertFenceToBlock } from '../diagram-blocks-shared/utils/convertFenceToBlock'

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    chartBlock: {
      /** Insert a live chart atom node whose source is raw chart JSON. */
      setChartBlock: (attrs: { source: string }) => ReturnType
    }
  }
}

/**
 * `chartBlock` — an atom node that renders a Recharts chart LIVE inside the
 * WYSIWYG editor and round-trips to/from a ```chart fenced code block in the
 * stored note markdown. `source` holds the raw chart JSON spec.
 */
export const ChartBlock = Node.create({
  name: 'chartBlock',
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
    return [{ tag: 'div[data-chart-block]' }]
  },

  renderHTML(props) {
    const { HTMLAttributes } = props
    return ['div', mergeAttributes(HTMLAttributes, { 'data-chart-block': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartBlockNodeView)
  },

  addCommands() {
    return {
      setChartBlock:
        (attrs) =>
        (commandProps) =>
          commandProps.commands.insertContent({ type: this.name, attrs }),
    }
  },

  addStorage() {
    return {
      markdown: {
        serialize: serializeFencedBlock('chart'),
        parse: {
          updateDOM(element: HTMLElement) {
            convertFenceToBlock(element, 'chart', 'data-chart-block')
          },
        },
      },
    }
  },
})
