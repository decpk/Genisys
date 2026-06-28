import type { AIMentionItem } from '../AIEditor.types'

export interface MentionPickerMenuProps {
  items: AIMentionItem[]
  selectedIndex: number
  menuLabel?: string
  onSelect: (item: AIMentionItem) => void
  onClose: () => void
}
