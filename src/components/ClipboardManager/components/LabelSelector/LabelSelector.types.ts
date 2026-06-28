import type { ClipboardLabel } from '@/store/clipboard-label-store'

export interface LabelSelectorProps {
  itemId: string
  assignedLabels: ClipboardLabel[]
  children: React.ReactNode
}
