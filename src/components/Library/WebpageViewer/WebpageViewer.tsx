import { ExternalLink, RefreshCw, Trash2 } from 'lucide-react'

import { AppLoader, AppLoaderGlyph } from '@/components/AppLoader'
import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'

import type { WebpageViewerProps } from './WebpageViewer.types'
import { STYLES } from './WebpageViewer.styles'
import { useWebpageViewerData } from './useWebpageViewerData'

export function WebpageViewer(props: WebpageViewerProps) {
  const { webpageId } = props
  const {
    webpage,
    htmlContent,
    isLoading,
    isUpdating,
    handleUpdate,
    handleDelete,
    handleOpenExternal,
  } = useWebpageViewerData(webpageId)

  if (isLoading) {
    return (
      <div className={STYLES.container}>
        <AppLoader />
      </div>
    )
  }

  if (!webpage || !htmlContent) {
    return (
      <div className={STYLES.container}>
        <div className={STYLES.loadingContainer}>
          <span className={STYLES.loadingText}>Failed to load webpage</span>
        </div>
      </div>
    )
  }

  const updateIcon = isUpdating ? (
    <AppLoaderGlyph size={14} />
  ) : (
    <RefreshCw size={14} />
  )

  return (
    <div className={STYLES.container}>
      {/* Header bar */}
      <div className={STYLES.header}>
        <div className={STYLES.headerTitle}>
          <div className={STYLES.headerName}>{webpage.name}</div>
          <div className={STYLES.headerUrl}>{webpage.url}</div>
        </div>

        <div className={STYLES.headerActions}>
          <IconButton
            variant="default"
            size="sm"
            onClick={handleOpenExternal}
            tooltip="Open original URL"
            tooltipSide="bottom"
          >
            <ExternalLink size={14} />
          </IconButton>

          <IconButton
            variant="default"
            size="sm"
            onClick={handleUpdate}
            disabled={isUpdating}
            tooltip="Re-fetch page"
            tooltipSide="bottom"
          >
            {updateIcon}
          </IconButton>

          <IconButton
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            tooltip="Delete saved page"
            tooltipSide="bottom"
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>

      {/* Sandboxed iframe — no allow-scripts for security */}
      <iframe
        className={STYLES.iframe}
        sandbox="allow-same-origin"
        srcDoc={htmlContent}
        title={webpage.name}
      />
    </div>
  )
}
