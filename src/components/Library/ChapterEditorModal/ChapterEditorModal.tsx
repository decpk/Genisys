import { useState, useCallback, useEffect } from 'react'
import { Save, X } from 'lucide-react'
import { KeyMod, KeyCode } from 'monaco-editor'
import type * as monaco from 'monaco-editor'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MarkdownEditorPreview } from '@/components/ui/markdown-editor-preview'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { ChapterEditorPreview } from '../ChapterEditorPreview'
import { useChapterEditorModal } from './ChapterEditorModal.hooks'
import type { ChapterEditorModalProps } from './ChapterEditorModal.types'

export function ChapterEditorModal(props: ChapterEditorModalProps): React.JSX.Element {
  const { open, onOpenChange, chapter, bookId } = props
  const [showDiscardAlert, setShowDiscardAlert] = useState(false)

  const {
    editingContent,
    setEditingContent,
    isDirty,
    handleSave,
  } = useChapterEditorModal(chapter, bookId)

  const handleSaveAndClose = useCallback(async () => {
    await handleSave()
    onOpenChange(false)
  }, [handleSave, onOpenChange])

  const handleRequestClose = useCallback(() => {
    if (isDirty) {
      setShowDiscardAlert(true)
    } else {
      onOpenChange(false)
    }
  }, [isDirty, onOpenChange])

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardAlert(false)
    onOpenChange(false)
  }, [onOpenChange])

  const handleEditorMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editor.addAction({
        id: 'chapter-editor-save',
        label: 'Save Chapter',
        // eslint-disable-next-line no-bitwise
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        run: () => handleSaveAndClose(),
      })
    },
    [handleSaveAndClose],
  )

  // Escape key handling
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        handleRequestClose()
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [open, handleRequestClose])

  const headerContent = (
    <div className="shrink-0 h-12 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-primary bg-primary/[0.07] px-2.5 py-0.5 rounded-full border border-primary/10 tracking-wide shrink-0">
            Ch. {chapter.chapterNumber}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {chapter.title}
          </span>
          {isDirty && (
            <span
              className="w-2 h-2 rounded-full bg-warning shrink-0"
              title="Unsaved changes"
            />
          )}
        </div>
          <IconButton
            variant="default"
            size="md"
            onClick={handleRequestClose}
            tooltip="Close"
            tooltipSide="bottom"
          >
            <X size={16} />
          </IconButton>
      </div>
    </div>
  );

  const footerContent = (
    <div className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-sm px-4 py-2 flex items-center justify-end gap-2">
      <Tooltip content="Save changes (⌘S)" side="top">
        <Button
          variant="default"
          size="xs"
          onClick={handleSaveAndClose}
          disabled={!isDirty}
        >
          <Save size={12} />
          <span>Save</span>
        </Button>
      </Tooltip>
    </div>
  )

  return (
    <>
      <Dialog open={open} onOpenChange={handleRequestClose}>
        <DialogContent
          showCloseButton={false}
          className="!w-[95vw] !h-[95vh] !max-w-none !max-h-none !p-0 !gap-0 flex flex-col overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            Edit Chapter {chapter.chapterNumber}: {chapter.title}
          </DialogTitle>

          <MarkdownEditorPreview
            content={editingContent}
            onChange={setEditingContent}
            header={headerContent}
            footer={footerContent}
            onEditorMount={handleEditorMount}
            renderPreview={(previewProps) => (
              <ChapterEditorPreview ref={previewProps.ref} content={previewProps.content} />
            )}
            className="flex-1"
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this chapter. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
