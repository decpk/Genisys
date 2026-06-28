import { Clipboard } from 'lucide-react'

import type { EntityLinkHandler } from '@/ai/entity-links/entity-links.types'
import { openClipboardItem } from './openClipboardItem'

export const clipboardEntityHandler: EntityLinkHandler = {
  type: 'clipboard',
  label: 'Clipboard item',
  icon: Clipboard,
  open: (id) => openClipboardItem(id),
}
