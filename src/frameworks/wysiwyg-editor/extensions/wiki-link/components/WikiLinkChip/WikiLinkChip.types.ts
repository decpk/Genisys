import type { NodeViewProps } from '@tiptap/react'

export interface WikiLinkChipData {
  label: string
  isResolved: boolean
  handleClick: (event: React.MouseEvent) => void
}

export type WikiLinkChipProps = NodeViewProps
