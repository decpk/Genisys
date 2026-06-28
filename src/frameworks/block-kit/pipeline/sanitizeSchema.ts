import { defaultSchema } from 'rehype-sanitize'

import type { BlockDefinition } from '../types'

export type SanitizeSchema = typeof defaultSchema

type AttrList = Array<string | [string, ...Array<string | number | boolean>]>

/** Per-pack additions merged on top of the block-derived schema. */
export interface SanitizeExtend {
  /** Extra tag names to allow. */
  tagNames?: string[]
  /** Extra attributes appended per tag (merged, not replaced). */
  attributes?: Record<string, AttrList>
  /** Extra URL protocols appended per attribute (e.g. `{ src: ['library-image'] }`). */
  protocols?: Record<string, string[]>
}

function mergeAttributes(
  base: Record<string, AttrList | undefined> | undefined,
  ...extras: Array<Record<string, AttrList> | undefined>
): Record<string, AttrList> {
  const out: Record<string, AttrList> = {}
  for (const key of Object.keys(base ?? {})) out[key] = [...(base?.[key] ?? [])]
  for (const extra of extras) {
    if (!extra) continue
    for (const [tag, list] of Object.entries(extra)) {
      out[tag] = [...(out[tag] ?? []), ...list]
    }
  }
  return out
}

function mergeProtocols(
  base: Record<string, string[]> | undefined,
  extra: Record<string, string[]> | undefined,
): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(base ?? {})) out[key] = [...value]
  for (const [key, value] of Object.entries(extra ?? {})) out[key] = [...(out[key] ?? []), ...value]
  return out
}

/**
 * Build a rehype-sanitize schema from the registry. ONLY registered block tags
 * and their declared attributes survive; everything else falls back to the safe
 * `defaultSchema`. KaTeX math placeholders are preserved so `rehype-katex` (run
 * after sanitize) can render them.
 */
export function buildSanitizeSchema(
  blocks: readonly BlockDefinition[],
  extend?: SanitizeExtend,
): SanitizeSchema {
  const blockTags = blocks.map((block) => block.tag)
  const blockAttrs: Record<string, AttrList> = {}
  for (const block of blocks) blockAttrs[block.tag] = [...block.attributes]

  const katexAttrs: Record<string, AttrList> = {
    span: [['className', 'math', 'math-inline', 'math-display']],
    div: [['className', 'math', 'math-display']],
  }

  return {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), ...blockTags, ...(extend?.tagNames ?? [])],
    attributes: mergeAttributes(
      defaultSchema.attributes as Record<string, AttrList>,
      blockAttrs,
      katexAttrs,
      extend?.attributes,
    ),
    protocols: mergeProtocols(defaultSchema.protocols, extend?.protocols),
  }
}
