import { X } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import type { SelectorPaneToolbarProps } from './SelectorPaneToolbar.types'

export function SelectorPaneToolbar({ onClose }: SelectorPaneToolbarProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-border/20 shrink-0">
      <span className="text-xs font-medium text-muted-foreground">Select a repository</span>
      <div className="ml-auto">
        <IconButton
          onClick={onClose}
          size="sm"
          tooltip="Close pane"
        >
          <X size={14} />
        </IconButton>
      </div>
    </div>
  )
}
