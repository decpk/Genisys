import { ExternalLink, Bookmark } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'

import type { ExtractedUrlRowProps } from './ExtractedUrlRow.types'
import { STYLES } from './ExtractedUrlRow.styles'

/** A single extracted-URL row: the (truncated) URL plus Open / Save actions. */
export function ExtractedUrlRow(props: ExtractedUrlRowProps): React.JSX.Element {
  const { url, onOpen, onSave } = props

  return (
    <div className={STYLES.row}>
      <span className={STYLES.url} title={url}>
        {url}
      </span>
      <div className={STYLES.actions}>
        <IconButton
          type="button"
          size="sm"
          variant="ghost"
          tooltip="Open in browser"
          onClick={() => onOpen(url)}
        >
          <ExternalLink size={14} />
        </IconButton>
        <IconButton
          type="button"
          size="sm"
          variant="ghost"
          tooltip="Save to collection"
          onClick={() => onSave(url)}
        >
          <Bookmark size={14} />
        </IconButton>
      </div>
    </div>
  )
}
