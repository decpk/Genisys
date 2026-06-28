import { Globe } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { ImportDestinationPicker } from './components/ImportDestinationPicker'
import { ImportSourceFields } from './components/ImportSourceFields'
import { ImportSourcePicker } from './components/ImportSourcePicker'
import { SOURCE_FIELD_LABELS } from './ImportWebpageDialog.constants'
import { STYLES } from './ImportWebpageDialog.styles'
import type { ImportWebpageDialogProps } from './ImportWebpageDialog.types'
import { useImportWebpageDialogData } from './hooks/useImportWebpageDialogData'

export function ImportWebpageDialog(props: ImportWebpageDialogProps) {
  const { open, onOpenChange } = props
  const {
    source,
    setSource,
    destination,
    setDestination,
    url,
    setUrl,
    html,
    setHtml,
    filePath,
    name,
    setName,
    error,
    isSaving,
    isReadingFile,
    isReady,
    pickFile,
    clearFile,
    handleImport,
    handleCancel,
  } = useImportWebpageDialogData(onOpenChange)

  const sourceLabel = SOURCE_FIELD_LABELS[source]
  const isImportDisabled = !isReady || isReadingFile

  const savingContent = (
    <div className={STYLES.savingOverlay}>
      <AppLoaderGlyph size={24} className="text-primary" />
      <span className={STYLES.savingText}>Importing content…</span>
      <span className={STYLES.savingText}>
        This may take a moment for large or image-heavy pages.
      </span>
    </div>
  )

  const formContent = (
    <div className={STYLES.body}>
      <div>
        <label className={STYLES.sectionLabel}>Source</label>
        <ImportSourcePicker value={source} onChange={setSource} />
      </div>
      <div>
        <label className={STYLES.sectionLabel}>Save as</label>
        <ImportDestinationPicker value={destination} onChange={setDestination} />
      </div>
      <div>
        <label className={STYLES.sectionLabel}>{sourceLabel}</label>
        <ImportSourceFields
          source={source}
          url={url}
          onUrlChange={setUrl}
          html={html}
          onHtmlChange={setHtml}
          filePath={filePath}
          isReadingFile={isReadingFile}
          onPickFile={pickFile}
          onClearFile={clearFile}
          onSubmit={handleImport}
        />
      </div>
      <div>
        <label className={STYLES.sectionLabel}>Name (optional)</label>
        <Input
          placeholder="Auto-detected from page title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>
      {error && <p className={STYLES.errorText}>{error}</p>}
    </div>
  )

  const bodyContent = isSaving ? savingContent : formContent

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Globe size={16} className="text-primary" />
            Import Webpage
          </DialogTitle>
          <DialogDescription>
            Import from a URL, pasted HTML, or a local .html file — and save it
            as an offline page or a book with chapters.
          </DialogDescription>
        </DialogHeader>

        {bodyContent}

        {!isSaving && (
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleImport} disabled={isImportDisabled}>
              Import
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
