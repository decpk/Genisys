import { CheckCircle2 } from 'lucide-react'

import { AppLoader, AppInlineLoader } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'

import type { BookmarkImportBodyProps } from './BookmarkImportBody.types'
import { STYLES } from './BookmarkImportBody.styles'
import { SourceRow } from '../SourceRow'
import { BookmarkImportFooter } from '../BookmarkImportFooter'

/** Renders the active view of the import dialog via ordered early-returns. */
export function BookmarkImportBody(props: BookmarkImportBodyProps): React.JSX.Element {
  const {
    view, sources, selectedSource, bookmarks, folders, targetFolderId, targetFolderName,
    error, sourcesError, importedCount, importing, newFolderOpen, preserveFolders,
    hasBrowserFolders, onPickSource, onSelectFolder, onBack, onImport, onOpenNewFolder,
    onNewFolderOpenChange, onFolderCreated, onTogglePreserveFolders,
  } = props

  if (view === 'loading-sources') {
    return (
      <div className={STYLES.center}>
        <AppLoader fullScreen={false} size={24} text="Finding browsers…" />
      </div>
    )
  }

  if (view === 'sources-error') {
    return <p className={STYLES.error}>{sourcesError}</p>
  }

  if (view === 'no-sources') {
    return <p className={STYLES.muted}>No browser bookmarks found on this machine.</p>
  }

  if (view === 'pick-source') {
    const rows = sources.map((source) => (
      <SourceRow key={source.path} source={source} onPick={onPickSource} />
    ))
    return <div className={STYLES.list}>{rows}</div>
  }

  if (view === 'loading-bookmarks') {
    return (
      <div className={STYLES.center}>
        <AppInlineLoader message="Reading bookmarks…" />
      </div>
    )
  }

  if (view === 'bookmarks-error') {
    return (
      <div>
        <p className={STYLES.error}>{error}</p>
        <div className={STYLES.errorActions}>
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  if (view === 'confirm') {
    const sourceLabel = selectedSource?.label ?? ''
    return (
      <div className={STYLES.confirm}>
        <p className={STYLES.confirmText}>
          Found <span className={STYLES.confirmStrong}>{bookmarks.length}</span> bookmarks in{' '}
          <span className={STYLES.confirmStrong}>{sourceLabel}</span>.
        </p>
        <BookmarkImportFooter
          folders={folders}
          targetFolderId={targetFolderId}
          targetFolderName={targetFolderName}
          bookmarkCount={bookmarks.length}
          importing={importing}
          newFolderOpen={newFolderOpen}
          preserveFolders={preserveFolders}
          hasBrowserFolders={hasBrowserFolders}
          onSelectFolder={onSelectFolder}
          onImport={onImport}
          onOpenNewFolder={onOpenNewFolder}
          onNewFolderOpenChange={onNewFolderOpenChange}
          onFolderCreated={onFolderCreated}
          onTogglePreserveFolders={onTogglePreserveFolders}
        />
      </div>
    )
  }

  const doneCount = importedCount ?? 0
  return (
    <div className={STYLES.done}>
      <CheckCircle2 size={28} className={STYLES.doneIcon} />
      <p className={STYLES.doneText}>Imported {doneCount} bookmarks</p>
    </div>
  )
}
