// ── block-kit · Public API ──────────────────────────────────────────────────
// A reusable markdown renderer with pluggable, sanitized custom HTML blocks.
// Standard markdown is untouched; registered `<namespace-*>` tags render as app
// components. Any Genisys app can define a block pack and mount <BlockMarkdown>.

export { BlockMarkdown } from './BlockMarkdown'
export { defineBlock } from './defineBlock'
export { createBlockRegistry } from './createBlockRegistry'
export { buildSanitizeSchema } from './pipeline/sanitizeSchema'
export { readAttrs } from './parse/readAttrs'
export { childElements, firstChild, collectText } from './parse/hastChildren'

export type {
  BlockDefinition,
  BlockDefinitionInput,
  BlockRegistry,
  BlockRenderProps,
  BlockChildrenContent,
  BlockSerializeContext,
} from './types'
export type { BlockMarkdownProps } from './BlockMarkdown.types'
export type { SanitizeExtend, SanitizeSchema } from './pipeline/sanitizeSchema'

import './block-kit.css'
