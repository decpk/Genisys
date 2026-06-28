import type { EntityLinkHandler, EntityType } from '../entity-links.types'
import { ENTITY_LINK_REGISTRY } from './registryState'

export function getEntityLink(type: EntityType): EntityLinkHandler | undefined {
  return ENTITY_LINK_REGISTRY.get(type)
}
