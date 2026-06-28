import type { Element } from 'hast'

/**
 * Flatten a hast element's `properties` into a simple string map for block
 * renderers. Boolean attributes (e.g. `correct`) become `''` when present and
 * `undefined` when absent/false.
 */
export function readAttrs(node: Element): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  const props = node.properties ?? {}
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue
    if (typeof value === 'boolean') out[key] = value ? '' : undefined
    else if (Array.isArray(value)) out[key] = value.join(' ')
    else out[key] = String(value)
  }
  return out
}
