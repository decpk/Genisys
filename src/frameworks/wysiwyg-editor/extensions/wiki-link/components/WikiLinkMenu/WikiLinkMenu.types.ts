import type { WikiLinkMenuItem } from '../../WikiLinkExtension.types'

export interface WikiLinkMenuProps {
  items: WikiLinkMenuItem[]
  command: (item: WikiLinkMenuItem) => void
}

export interface WikiLinkMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}
