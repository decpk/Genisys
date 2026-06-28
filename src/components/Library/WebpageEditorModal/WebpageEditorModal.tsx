import { useState, useCallback, useEffect } from 'react'
import { Save, X, Code } from 'lucide-react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { AppLoader } from '@/components/AppLoader'
import { cn } from '@/lib/utils'

import { HtmlEditorPane } from './components/HtmlEditorPane'
import { useWebpageEditorModalData } from './hooks/useWebpageEditorModalData'
import type { WebpageEditorModalProps } from './WebpageEditorModal.types'
import { STYLES } from './WebpageEditorModal.styles'

export function WebpageEditorModal(
  props: WebpageEditorModalProps,
): React.JSX.Element {
  const { webpage, open, onOpenChange } = props
  const [showDiscardAlert, setShowDiscardAlert] = useState(false)

  const {
    draft,
    setDraft,
    isDirty,
    isLoading,
    handleSaveAndClose,
    handleEditorMount,
  } = useWebpageEditorModalData(webpage, open, onOpenChange)

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

  // Escape closes the modal (with discard guard) without leaking to the page.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        handleRequestClose()
      }
    }
    document.addEventListener('keydown', handler, true)
    return () => document.removeEventListener('keydown', handler, true)
  }, [open, handleRequestClose])

  const pageName = webpage ? webpage.name : ''

  return (
    <>
      <Dialog open={open} onOpenChange={handleRequestClose}>
        <DialogContent
          showCloseButton={false}
          className={STYLES.content}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Edit page: {pageName}</DialogTitle>

          <div className={STYLES.header}>
            <div className={STYLES.headerInner}>
              <div className={STYLES.headerLeft}>
                <span className={STYLES.headerBadge}>
                  <Code size={12} />
                </span>
                <span className={STYLES.headerName}>{pageName}</span>
                {isDirty && (
                  <span className={STYLES.dirtyDot} title="Unsaved changes" />
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

          {isLoading ? (
            <div className={STYLES.loadingBody}>
              <AppLoader />
            </div>
          ) : (
            <div className={cn(STYLES.body)}>
              <HtmlEditorPane
                content={draft}
                onChange={setDraft}
                onEditorMount={handleEditorMount}
              />
            </div>
          )}

          <div className={STYLES.footer}>
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
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this page. Are you sure you want to
              discard them?
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
