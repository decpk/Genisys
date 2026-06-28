import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import type { PluggableList } from 'unified'

import type { SanitizeSchema } from './sanitizeSchema'

/**
 * Rehype pipeline for block rendering. Order matters:
 *   1. rehype-raw      — turn raw `<lib-*>` HTML into real hast elements
 *   2. rehype-sanitize — strip anything not in the schema (XSS-safe)
 *   3. rehype-katex    — render math (trusted output, runs after sanitize)
 */
export function createRehypePlugins(schema: SanitizeSchema): PluggableList {
  return [rehypeRaw, [rehypeSanitize, schema], rehypeKatex]
}
