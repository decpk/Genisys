import type { LucideIcon } from 'lucide-react'

export type EntityType = string

export interface EntityLinkHandler {
  type: EntityType
  /** Human label used as fallback chip text when the token has no |label part. */
  label: string
  icon: LucideIcon
  /** Imperative open action — call store actions here. May be async. */
  open: (id: string) => void | Promise<void>
}

export interface ParsedEntityHref {
  type: EntityType
  id: string
}
