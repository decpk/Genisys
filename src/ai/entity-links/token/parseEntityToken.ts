import { ENTITY_TOKEN_REGEX } from '../entity-links.constants'
import { getEntityLink } from '../registry/getEntityLink'
import { buildEntityHref } from './buildEntityHref'

export function parseEntityToken(text: string): string {
  // Reset lastIndex defensively (regex has /g flag).
  ENTITY_TOKEN_REGEX.lastIndex = 0
  return text.replace(ENTITY_TOKEN_REGEX, (_match, type: string, id: string, label?: string) => {
    const handler = getEntityLink(type)
    let visible: string
    if (label) visible = label
    else if (handler) visible = handler.label
    else visible = `${type}:${id}`
    // Keep visible text valid as markdown link text.
    const safeVisible = visible.replace(/[\[\]]/g, '')
    return `[${safeVisible}](${buildEntityHref(type, id)})`
  })
}
