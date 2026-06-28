import { ENTITY_HREF_PREFIX } from '../entity-links.constants'
import type { ParsedEntityHref } from '../entity-links.types'

export function parseEntityHref(href: string | undefined): ParsedEntityHref | null {
  if (!href || !href.startsWith(ENTITY_HREF_PREFIX)) return null
  const raw = href.slice(ENTITY_HREF_PREFIX.length)
  const sepIdx = raw.indexOf(':')
  if (sepIdx <= 0) return null
  const type = raw.slice(0, sepIdx)
  const encodedId = raw.slice(sepIdx + 1)
  if (!encodedId) return null
  let id: string
  try {
    id = decodeURIComponent(encodedId)
  } catch {
    return null
  }
  return { type, id }
}
