import { cn } from '@/lib/utils'
import { getContentWidthClasses } from '@/lib/content-width'
import { WysiwygEditor } from '@/frameworks/wysiwyg-editor'

import { notesMainContentStyles as styles } from '../../NotesMainContent.styles'
import { NotesEditorHeader } from './NotesEditorHeader'
import { NotesScrollProgressBar } from './components/NotesScrollProgressBar'
import type { NotesEditorViewProps } from './NotesEditorView.types'
import { useNotesEditorViewData } from './hooks/useNotesEditorViewData'

export function NotesEditorView(props: NotesEditorViewProps): React.JSX.Element {
  const { note, noteLabels, allLabels, sourceInfo, onContentChange, onToggleLabel, showLabels, contentWidth, isReadOnly, isInSplit } = props

  const {
    labelPopoverOpen,
    setLabelPopoverOpen,
    activeLabelIds,
    handleHighlightApplied,
    handleHighlightRemoved,
    handleEditorReady,
    setScrollEl,
    progressBarRef,
    percentLabelRef,
    hasHeader,
    wikiLinkConfig,
    showScrollPercentage,
    showScrollProgressBar,
  } = useNotesEditorViewData(props)

  const widthClasses = getContentWidthClasses(contentWidth, { relative: isInSplit })
  const readOnlyClass = isReadOnly ? 'wysiwyg-editor-readonly' : undefined

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <NotesScrollProgressBar fillRef={progressBarRef} labelRef={percentLabelRef} showBar={showScrollProgressBar} showLabel={showScrollPercentage} />
      <div ref={setScrollEl} className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className={cn('flex flex-col flex-1 min-w-0 mx-auto w-full', widthClasses.maxWidth, widthClasses.paddingX)}>
          {hasHeader && (
            <NotesEditorHeader
              sourceInfo={sourceInfo}
              showLabels={showLabels}
              noteLabels={noteLabels}
              allLabels={allLabels}
              isReadOnly={isReadOnly}
              onToggleLabel={onToggleLabel}
              labelPopoverOpen={labelPopoverOpen}
              setLabelPopoverOpen={setLabelPopoverOpen}
              activeLabelIds={activeLabelIds}
            />
          )}

          <div className={`${styles.editorContainer} notes-editor-content`}>
            <WysiwygEditor
              key={note.id}
              value={note.content}
              onChange={onContentChange}
              onEditorReady={handleEditorReady}
              onHighlightApplied={handleHighlightApplied}
              onHighlightRemoved={handleHighlightRemoved}
              placeholder="Start writing…"
              enableAIAutocomplete
              wikiLink={wikiLinkConfig}
              readOnly={isReadOnly}
              className={readOnlyClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
