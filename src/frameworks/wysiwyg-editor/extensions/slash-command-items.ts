import type { SlashCommandItem } from './slash-command'
import { showInlinePrompt } from './ai-inline-writer/plugin/showInlinePrompt'

export const slashCommandItems: SlashCommandItem[] = [
  {
    id: 'aiWrite',
    label: 'AI Write',
    description: 'Ask AI to write at cursor (⌘J)',
    icon: '✨',
    keywords: ['ai', 'write', 'generate', 'ask', 'prompt', 'inline'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).run()
      showInlinePrompt(editor)
    },
  },
  {
    id: 'paragraph',
    label: 'Text',
    description: 'Plain text block',
    icon: '¶',
    keywords: ['paragraph', 'text', 'plain'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    id: 'heading1',
    label: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    keywords: ['heading', 'h1', 'title', 'large'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
  },
  {
    id: 'heading2',
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    keywords: ['heading', 'h2', 'subtitle', 'medium'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
  },
  {
    id: 'heading3',
    label: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    keywords: ['heading', 'h3', 'small'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    },
  },
  {
    id: 'bulletList',
    label: 'Bullet List',
    description: 'Unordered list with bullets',
    icon: '•',
    keywords: ['bullet', 'unordered', 'list', 'ul'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    id: 'numberedList',
    label: 'Numbered List',
    description: 'Ordered list with numbers',
    icon: '1.',
    keywords: ['numbered', 'ordered', 'list', 'ol'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    id: 'taskList',
    label: 'Task List',
    description: 'List with checkboxes',
    icon: '☑',
    keywords: ['task', 'todo', 'checkbox', 'checklist'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    id: 'blockquote',
    label: 'Blockquote',
    description: 'Quote or callout block',
    icon: '❝',
    keywords: ['quote', 'blockquote', 'callout'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run()
    },
  },
  {
    id: 'codeBlock',
    label: 'Code Block',
    description: 'Syntax-highlighted code',
    icon: '</>',
    keywords: ['code', 'codeblock', 'snippet', 'pre'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run()
    },
  },
  {
    id: 'horizontalRule',
    label: 'Divider',
    description: 'Horizontal line separator',
    icon: '—',
    keywords: ['divider', 'hr', 'horizontal', 'rule', 'separator'],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    id: 'stylizedDivider',
    label: 'Fancy Divider',
    description: 'Decorative gradient separator with center glyph',
    icon: '✦',
    keywords: [
      'fancy',
      'gold',
      'ornate',
      'decorative',
      'gradient',
      'section',
      'break',
      'divider',
      'separator',
    ],
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setStylizedDivider().run()
    },
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a 3×3 table',
    icon: '▦',
    keywords: ['table', 'grid', 'spreadsheet'],
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Insert image from URL',
    icon: '🖼',
    keywords: ['image', 'picture', 'photo', 'img'],
    command: (editor, range) => {
      const url = window.prompt('Enter image URL')
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
      } else {
        editor.chain().focus().deleteRange(range).run()
      }
    },
  },
  {
    id: 'diagram',
    label: 'Diagram',
    description: 'Live Mermaid diagram',
    icon: '◈',
    keywords: ['diagram', 'flowchart', 'mermaid', 'graph', 'mindmap'],
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMermaidBlock({ source: 'graph TD\n  A[Start] --> B[End]' })
        .run()
    },
  },
  {
    id: 'chart',
    label: 'Chart',
    description: 'Live data chart',
    icon: '📊',
    keywords: ['chart', 'graph', 'data', 'bar', 'line', 'pie'],
    command: (editor, range) => {
      const source = JSON.stringify(
        {
          type: 'bar',
          title: 'Example',
          data: [
            { name: 'A', value: 10 },
            { name: 'B', value: 20 },
          ],
          xKey: 'name',
          series: [{ key: 'value' }],
        },
        null,
        2,
      )
      editor.chain().focus().deleteRange(range).setChartBlock({ source }).run()
    },
  },
]

export function filterSlashItems(query: string): SlashCommandItem[] {
  if (!query) return slashCommandItems
  const lower = query.toLowerCase()
  return slashCommandItems.filter(
    (item) =>
      item.label.toLowerCase().includes(lower) ||
      item.keywords.some((kw) => kw.includes(lower)),
  )
}
