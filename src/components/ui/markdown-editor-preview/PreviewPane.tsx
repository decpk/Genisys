import { forwardRef } from 'react'

import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import type { PreviewPaneProps } from './MarkdownEditorPreview.types'

export const PreviewPane = forwardRef<HTMLDivElement, PreviewPaneProps>(
  function PreviewPane(props, ref) {
    const { content, variant = 'default', className } = props

    return (
      <div
        ref={ref}
        className="h-full overflow-y-auto px-6 py-4"
      >
        <MarkdownRenderer
          content={content}
          variant={variant}
          className={className}
        />
      </div>
    )
  },
)
