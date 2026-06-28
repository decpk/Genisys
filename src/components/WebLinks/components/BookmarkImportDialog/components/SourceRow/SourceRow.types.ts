import type { BrowserBookmarkSource } from '@/components/WebLinks/WebLinks.types'

/** Props for a single selectable browser-source row. */
export interface SourceRowProps {
  /** The browser source this row represents. */
  source: BrowserBookmarkSource
  /** Invoked with the source when the row is clicked. */
  onPick: (source: BrowserBookmarkSource) => void
}
