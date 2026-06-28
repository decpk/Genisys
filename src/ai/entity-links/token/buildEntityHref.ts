import { ENTITY_HREF_PREFIX } from '../entity-links.constants'

export function buildEntityHref(type: string, id: string): string {
  return `${ENTITY_HREF_PREFIX}${type}:${encodeURIComponent(id)}`
}
