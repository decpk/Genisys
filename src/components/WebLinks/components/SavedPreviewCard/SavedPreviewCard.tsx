import { useState } from 'react'

import { ExternalLink, FolderInput, MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { MoveToFolderMenu } from '../MoveToFolderMenu'
import type { SavedPreviewCardProps } from './SavedPreviewCard.types'
import { STYLES } from './SavedPreviewCard.styles'
import { useSavedPreviewCardData } from './useSavedPreviewCardData'
import { getCardTitle } from './utils/getCardTitle'
import { getCardVisual } from './utils/getCardVisual'

/** Hide a broken `<img>` (favicon / hero) on load error. */
function hideImage(event: React.SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.style.display = 'none'
}

/** A saved-preview card: hero, site row, title, URL, and a footer action row. */
export function SavedPreviewCard(props: SavedPreviewCardProps): React.JSX.Element {
  const { preview } = props
  const { menuOpen, setMenuOpen, onOpen, onRefresh, isRefreshing, onDelete } =
    useSavedPreviewCardData(preview)
  // Track the specific image src that failed to load. Keying on the URL (rather
  // than a boolean) lets a refreshed og:image be re-attempted automatically and
  // avoids resetting state from an effect.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const title = getCardTitle(preview)
  const displayUrl = preview.finalUrl || preview.url
  const visual = getCardVisual(preview)
  const showImage = Boolean(visual.imageUrl) && failedSrc !== visual.imageUrl

  let heroEl: React.JSX.Element
  if (showImage) {
    heroEl = (
      <img
        className={STYLES.hero}
        src={visual.imageUrl}
        alt=""
        onError={() => setFailedSrc(visual.imageUrl)}
      />
    )
  } else {
    heroEl = (
      <div className={STYLES.synthBanner} style={{ background: visual.background }}>
        <span className={STYLES.monogram}>{visual.monogram}</span>
        {visual.faviconUrl ? (
          <img className={STYLES.bannerFavicon} src={visual.faviconUrl} alt="" onError={hideImage} />
        ) : null}
      </div>
    )
  }

  let faviconEl: React.JSX.Element | null = null
  if (preview.faviconUrl) {
    faviconEl = <img className={STYLES.favicon} src={preview.faviconUrl} alt="" onError={hideImage} />
  }

  return (
    <div className={isRefreshing ? `${STYLES.card} ${STYLES.cardBusy}` : STYLES.card}>
      {heroEl}
      <div className={STYLES.body}>
        <div className={STYLES.siteRow}>
          {faviconEl}
          <span className={STYLES.siteName}>{preview.siteName}</span>
        </div>
        <h3 className={STYLES.title}>{title}</h3>
        <span className={STYLES.url}>{displayUrl}</span>
      </div>

      <div className={STYLES.footer}>
        <IconButton type="button" size="sm" variant="ghost" tooltip="Open in browser" onClick={onOpen}>
          <ExternalLink size={15} />
        </IconButton>
        <MoveToFolderMenu previewId={preview.id}>
          <IconButton type="button" size="sm" variant="ghost" tooltip="Move to folder">
            <FolderInput size={15} />
          </IconButton>
        </MoveToFolderMenu>

        <div className={STYLES.spacer} />

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <IconButton type="button" size="sm" variant="ghost" tooltip="More" tooltipDisabled={menuOpen}>
              <MoreHorizontal size={15} />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onOpen}>
              <ExternalLink />
              Open in browser
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onRefresh} disabled={isRefreshing}>
              <RefreshCw />
              Refresh preview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
              <Trash2 className="text-destructive" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
