import type { EntityLinkHandler, EntityType } from '../entity-links.types'

// Module-private singleton map. Internal state — handlers register via registerEntityLink.
export const ENTITY_LINK_REGISTRY: Map<EntityType, EntityLinkHandler> = new Map()
