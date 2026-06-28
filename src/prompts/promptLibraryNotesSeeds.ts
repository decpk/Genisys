import type { PmCategory, PmFolder, PmPrompt } from '@/store/prompt-manager-store'

const NOW = '2026-04-16T00:00:00.000Z'

// A dedicated built-in folder that only surfaces inside the Notes app. Both
// the folder (`scopes`) and the prompt (`appScopes`) are pinned to `notes`,
// so the prompt never leaks into Chat / Code Review / other prompt pickers.
export const NOTES_FOLDER: PmFolder = {
  id: 'f2f6176f-1c92-4dc9-9bb8-8d22ec5f0003',
  name: 'Notes',
  color: '#22c55e',
  scopes: ['notes'],
  sortOrder: -2,
  createdAt: NOW,
  updatedAt: NOW,
  isBuiltIn: true,
}

export const NOTES_CATEGORIES: PmCategory[] = [
  {
    id: 'c8a91789-c6fb-4d97-bcb0-2d6e7f4d2001',
    folderId: NOTES_FOLDER.id,
    name: 'Understand and Visualize',
    icon: '',
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
]

const EXPLAIN_VISUALLY_BODY = `You are an expert explainer and information designer. Deeply read and understand the **current note** the user is viewing, then explain it back to them in a way that builds genuine understanding — and reinforce that explanation with **visuals**.

Do the following:

1. **Explain in prose first.** Summarize what the note is actually about, the key ideas, how they connect, and any non-obvious implications. Be concrete and specific to *this* note — do not give generic advice.

2. **Produce at least one diagram** using a fenced \`mermaid\` code block. Choose the diagram type that best fits the note's content:
   - \`flowchart\` for processes, decisions, or pipelines
   - \`mindmap\` for hierarchies of related concepts
   - \`sequenceDiagram\` for step-by-step interactions over time
   - \`timeline\` for chronological events
   - \`graph\` for relationships between entities
   Keep node labels short and the syntax valid.

3. **Produce at least one data visualization** using a fenced \`chart\` code block whenever the note contains anything quantitative, comparative, or proportional (counts, scores, shares, trends, before/after, categories). The block body MUST be a single valid JSON object matching EXACTLY this shape:

\`\`\`chart
{
  "type": "bar",
  "title": "Optional chart title",
  "data": [{ "label": "A", "value": 10 }, { "label": "B", "value": 20 }],
  "xKey": "label",
  "series": [{ "key": "value", "name": "Value", "color": "#3b82f6" }],
  "nameKey": "label",
  "valueKey": "value",
  "colors": ["#3b82f6", "#22c55e", "#f59e0b"]
}
\`\`\`

   Rules for the chart JSON:
   - \`type\` must be one of \`"bar"\`, \`"line"\`, \`"area"\`, or \`"pie"\`.
   - For \`bar\`/\`line\`/\`area\`: use \`xKey\` + \`series\` (one entry per measured value).
   - For \`pie\`: use \`nameKey\` + \`valueKey\` (and optional \`colors\`).
   - \`title\`, \`color\`, \`name\`, and \`colors\` are optional.
   - Emit **valid JSON only** inside the block — double-quoted keys/strings, no comments, no trailing commas, no markdown fences inside the JSON.

4. **Pick the best visual for the content.** If the note is purely conceptual, a \`mermaid\` diagram alone is fine. If it has numbers or comparisons, include a \`chart\`. When both add value, include both. Always explain *why* each visual is shaped the way it is.

If the note is empty or too sparse to visualize, say so plainly and ask the user what they'd like to capture.`

export const NOTES_PROMPTS: PmPrompt[] = [
  {
    id: 'p-notes-builtin-0001-explain-this-note-visually',
    folderId: NOTES_FOLDER.id,
    categoryId: NOTES_CATEGORIES[0].id,
    title: 'Explain this note visually',
    description:
      'Deeply explains the current note and reinforces it with a Mermaid diagram and/or a data chart.',
    content: EXPLAIN_VISUALLY_BODY,
    isPinned: true,
    appScopes: ['notes'],
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
]
