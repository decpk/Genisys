import type { EntityLinkHandler } from '../entity-links.types'
import { ENTITY_LINK_REGISTRY } from './registryState'

export function registerEntityLink(handler: EntityLinkHandler): void {
  ENTITY_LINK_REGISTRY.set(handler.type, handler)
}
