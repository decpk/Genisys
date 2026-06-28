import { AppLoader } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'

import type { ScreenshotImportBodyProps } from './ScreenshotImportBody.types'
import { STYLES } from './ScreenshotImportBody.styles'
import { ScreenshotDropZone } from '../ScreenshotDropZone'
import { ExtractedUrlRow } from '../ExtractedUrlRow'

/** Renders the active view of the screenshot-import dialog via early-returns. */
export function ScreenshotImportBody(props: ScreenshotImportBodyProps): React.JSX.Element {
  const {
    view, imageDataUrl, urls, error, fileInputRef, onDrop, onDragOver,
    onChooseImage, onFileChange, onOpenUrl, onSaveUrl, onOpenAll, onReset,
  } = props

  if (view === 'drop') {
    return (
      <ScreenshotDropZone
        fileInputRef={fileInputRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onChooseImage={onChooseImage}
        onFileChange={onFileChange}
      />
    )
  }

  if (view === 'extracting') {
    return (
      <div className={STYLES.center}>
        {imageDataUrl && <img src={imageDataUrl} alt="" className={STYLES.thumb} />}
        <AppLoader fullScreen={false} size={24} text="Scanning screenshot…" />
      </div>
    )
  }

  if (view === 'error') {
    return (
      <div>
        <p className={STYLES.error}>{error}</p>
        <div className={STYLES.errorActions}>
          <Button type="button" variant="outline" onClick={onReset}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (urls.length === 0) {
    return (
      <div className={STYLES.empty}>
        {imageDataUrl && <img src={imageDataUrl} alt="" className={STYLES.thumb} />}
        <p className={STYLES.muted}>No URLs found in that image.</p>
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Try another
        </Button>
      </div>
    )
  }

  const rows = urls.map((url) => (
    <ExtractedUrlRow key={url} url={url} onOpen={onOpenUrl} onSave={onSaveUrl} />
  ))

  return (
    <div className={STYLES.results}>
      {imageDataUrl && <img src={imageDataUrl} alt="" className={STYLES.thumb} />}
      <div className={STYLES.resultsHeader}>
        <span className={STYLES.resultsCount}>{urls.length} URL(s)</span>
        <div className={STYLES.resultsActions}>
          <Button type="button" variant="outline" size="sm" onClick={onOpenAll}>
            Open all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            Scan another
          </Button>
        </div>
      </div>
      <div className={STYLES.list}>{rows}</div>
    </div>
  )
}
