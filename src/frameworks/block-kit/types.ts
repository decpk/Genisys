import type { ComponentType, ReactNode } from 'react'
import type { Element } from 'hast'

/** Props passed to a block's `Renderer`. */
export interface BlockRenderProps {
  /** The raw hast element for this block — read structured children/attrs from here. */
  node: Element
  /** Flattened string attributes parsed from the element. */
  attrs: Record<string, string | undefined>
  /** The block's already-rendered markdown children. */
  children: ReactNode
  /** True while the source markdown is still streaming in (defer heavy renders). */
  isStreaming: boolean
}

/** How a block's element body should be treated by authors/sanitization. */
export type BlockChildrenContent = 'markdown' | 'elements' | 'verbatim'

/** Context handed to a block's static-HTML serializer (exporters). */
export interface BlockSerializeContext {
  /** Serialize a hast element's children to HTML. */
  renderChildrenHtml: (node: Element) => string
  /** Render a markdown string to HTML. */
  renderMarkdown: (markdown: string) => string
  /** Escape a raw string for safe HTML embedding. */
  escapeHtml: (value: string) => string
}

/** A single custom block definition — the unit of extension. */
export interface BlockDefinition {
  /** Hyphenated custom-element tag, unique within a registry (e.g. `lib-callout`). */
  tag: string
  /** Attribute names allowed through sanitization for this tag. */
  attributes: string[]
  /** How the element body should be treated. */
  childrenContent: BlockChildrenContent
  /** React renderer for the live app. */
  Renderer: ComponentType<BlockRenderProps>
  /** Optional static-HTML serializer for exporters (HTML/PDF). */
  toHtml?: (node: Element, ctx: BlockSerializeContext) => string
}

/** Input shape for `defineBlock` (defaults applied for `attributes`/`childrenContent`). */
export interface BlockDefinitionInput {
  tag: string
  attributes?: string[]
  childrenContent?: BlockChildrenContent
  Renderer: ComponentType<BlockRenderProps>
  toHtml?: (node: Element, ctx: BlockSerializeContext) => string
}

/** A reactive registry of block definitions. */
export interface BlockRegistry {
  /** Stable snapshot of all registered blocks (safe for `useSyncExternalStore`). */
  getBlocks: () => readonly BlockDefinition[]
  /** Look up a block by tag. */
  get: (tag: string) => BlockDefinition | undefined
  /** Register (or replace) a block. */
  register: (block: BlockDefinition) => void
  /** Remove a block by tag. */
  unregister: (tag: string) => void
  /** Subscribe to registry changes. */
  subscribe: (listener: () => void) => () => void
}
