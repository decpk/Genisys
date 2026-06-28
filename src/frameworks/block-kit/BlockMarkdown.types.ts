import type { ReactNode } from 'react'
import type { Components } from 'react-markdown'
import type { PluggableList } from 'unified'

import type { BlockRegistry } from './types'
import type { SanitizeExtend } from './pipeline/sanitizeSchema'

export interface BlockMarkdownProps {
  /** Markdown source (may contain registered `<lib-*>` blocks). */
  content: string
  /** The block registry to dispatch custom tags through. */
  registry: BlockRegistry
  /** Standard-element component overrides (headings, code, img, …). */
  components?: Partial<Components>
  /** True while `content` is still streaming. */
  isStreaming?: boolean
  /** Extra remark plugins (e.g. image-source extraction). */
  remarkPlugins?: PluggableList
  /** Custom URL schemes to allow through untouched (e.g. `library-image`). */
  urlSchemes?: readonly string[]
  /** Per-pack sanitize additions (extra attributes/protocols). */
  sanitize?: SanitizeExtend
  /** Wrapper class name. */
  className?: string
  /** Optional wrapper content rendered when `content` is empty. */
  fallback?: ReactNode
}
