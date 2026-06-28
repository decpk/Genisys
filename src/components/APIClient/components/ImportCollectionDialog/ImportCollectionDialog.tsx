import { AlertCircle, Clipboard, FileUp, FolderInput, Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useImportCollectionDialogData } from './useImportCollectionDialogData'
import { CollectionImportPreviewCard } from './components/CollectionImportPreviewCard'
import type { ImportCollectionDialogProps } from './ImportCollectionDialog.types'

export function ImportCollectionDialog(
  props: ImportCollectionDialogProps,
): React.JSX.Element {
  const { open, onOpenChange } = props
  const data = useImportCollectionDialogData(open, onOpenChange)

  const inlineError = data.importError ?? data.previewError
  const importDisabled = !data.preview || data.importing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary">
              <FolderInput size={15} />
            </span>
            Import Collection
          </DialogTitle>
          <DialogDescription className="text-sm">
            Import a full Postman, OpenAPI, or Insomnia collection from a file or pasted
            text. The format is detected automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={data.handlePickFile}
              className="h-7 px-2.5 text-xs gap-1.5"
            >
              <FileUp size={12} />
              Choose File
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={data.handlePasteFromClipboard}
              className="h-7 px-2.5 text-xs gap-1.5"
            >
              <Clipboard size={12} />
              Paste
            </Button>
            {data.content && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={data.handleClear}
                className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground ml-auto"
              >
                <X size={12} />
                Clear
              </Button>
            )}
          </div>

          {data.fileName && (
            <p className="text-2xs text-muted-foreground -mt-2">
              Loaded from <span className="text-foreground">{data.fileName}</span>
            </p>
          )}

          <textarea
            value={data.content}
            onChange={(event) => data.handleContentChange(event.target.value)}
            placeholder="Paste your collection JSON or YAML here…"
            spellCheck={false}
            className="w-full h-40 p-3 text-xs font-sans rounded-md border border-input bg-muted/30 dark:bg-card text-foreground resize-none outline-none select-text placeholder:text-muted-foreground/50 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 transition-[color,box-shadow]"
          />

          {data.preview && <CollectionImportPreviewCard preview={data.preview} />}

          {inlineError && (
            <div className="flex gap-2 items-start rounded-md border border-destructive/30 bg-destructive/10 text-destructive px-3 py-2 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{inlineError}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={data.handleImport}
            disabled={importDisabled}
            className="gap-1.5"
          >
            {data.importing && <Loader2 size={13} className="animate-spin" />}
            {data.importing ? 'Importing…' : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
