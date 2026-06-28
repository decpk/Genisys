import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { Markdown } from 'tiptap-markdown'
import { common, createLowlight } from 'lowlight'
import { SelectionHighlight } from '../extensions/selection-highlight'
import { StylizedDivider } from '../extensions/stylized-divider'
import { DiagramCodeBlock } from '../extensions/diagram-code-block'
import { MermaidBlock } from '../extensions/mermaid-block'
import { ChartBlock } from '../extensions/chart-block'

const lowlight = createLowlight(common)

export function buildExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      codeBlock: false, // replaced by CodeBlockLowlight
    }),
    Placeholder.configure({
      placeholder: placeholder ?? 'Type / for commands…',
    }),
    Underline,
    Highlight.configure({ multicolor: false }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: false }),
    TableRow,
    TableCell,
    TableHeader,
    DiagramCodeBlock.configure({ lowlight }),
    // Live diagram/chart atom nodes. Their markdown `parse.updateDOM` hooks
    // rewrite ```mermaid / ```chart fences (rendered by markdown-it as
    // <pre><code class="language-…">) into <div data-…-block> BEFORE
    // ProseMirror parses, so these claim those two languages instead of
    // DiagramCodeBlock (CodeBlockLowlight), while round-tripping back to a
    // fenced block on serialize.
    MermaidBlock,
    ChartBlock,
    Markdown.configure({
      transformPastedText: true,
      transformCopiedText: true,
    }),
    SelectionHighlight,
    StylizedDivider,
  ]
}
