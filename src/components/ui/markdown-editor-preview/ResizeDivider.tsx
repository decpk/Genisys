import { GripVertical } from 'lucide-react'

import type { ResizeDividerProps } from './MarkdownEditorPreview.types'

export function ResizeDivider(props: ResizeDividerProps): React.JSX.Element {
  const { onMouseDown } = props

  return (
    <div
      onMouseDown={onMouseDown}
      className="w-[5px] shrink-0 bg-border/30 hover:bg-primary/30 active:bg-primary/50 transition-colors cursor-col-resize flex items-center justify-center group"
    >
      <GripVertical
        size={12}
        className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors"
      />
    </div>
  )
}
