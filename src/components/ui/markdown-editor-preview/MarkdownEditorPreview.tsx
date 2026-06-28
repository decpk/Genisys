import { useState, useCallback } from 'react'

import { cn } from '@/lib/utils'

import { EditorPane } from './EditorPane'
import { PreviewPane } from './PreviewPane'
import { PaneLabels } from './PaneLabels'
import { ResizeDivider } from './ResizeDivider'
import { useMarkdownEditorPreviewData } from './hooks/useMarkdownEditorPreviewData'
import type { MarkdownEditorPreviewProps } from './MarkdownEditorPreview.types'

export function MarkdownEditorPreview(props: MarkdownEditorPreviewProps): React.JSX.Element {
  const {
    content,
    onChange,
    header,
    footer,
    leftPaneLabel = 'Editor',
    rightPaneLabel = 'Preview',
    showPaneLabels = true,
    defaultSplitFraction = 0.5,
    minSplitFraction = 0.25,
    maxSplitFraction = 0.75,
    scrollSyncEnabled: scrollSyncEnabledProp = true,
    editorOptions,
    onEditorMount,
    renderPreview,
    previewVariant,
    previewClassName,
    className,
  } = props

  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(scrollSyncEnabledProp)
  const handleScrollSyncToggle = useCallback(() => setScrollSyncEnabled((v) => !v), [])

  const {
    editorRef,
    previewRef,
    splitContainerRef,
    leftPercent,
    rightPercent,
    handleMouseDown,
  } = useMarkdownEditorPreviewData(
    scrollSyncEnabled,
    defaultSplitFraction,
    minSplitFraction,
    maxSplitFraction,
  )

  return (
    <div className={cn('flex flex-col overflow-hidden', className)}>
      {header}

      {showPaneLabels && (
        <PaneLabels
          leftPercent={leftPercent}
          rightPercent={rightPercent}
          leftLabel={leftPaneLabel}
          rightLabel={rightPaneLabel}
          scrollSyncEnabled={scrollSyncEnabled}
          onScrollSyncToggle={handleScrollSyncToggle}
        />
      )}

      <div ref={splitContainerRef} className="flex-1 flex overflow-hidden relative">
        <div style={{ width: leftPercent }} className="h-full overflow-hidden">
          <EditorPane
            content={content}
            onChange={onChange}
            editorOptions={editorOptions}
            onEditorMount={onEditorMount}
            editorRef={editorRef}
          />
        </div>

        <ResizeDivider onMouseDown={handleMouseDown} />

        <div style={{ width: rightPercent }} className="h-full overflow-hidden border-l border-border/20">
          {renderPreview
            ? renderPreview({ content, ref: previewRef })
            : (
              <PreviewPane
                ref={previewRef}
                content={content}
                variant={previewVariant}
                className={previewClassName}
              />
            )
          }
        </div>
      </div>

      {footer}
    </div>
  )
}
