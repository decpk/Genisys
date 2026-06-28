import type { ContentWidth } from '@/store/settings-store'
import { CONTENT_WIDTH_CONFIG, DEFAULT_CONTENT_WIDTH } from '../contentWidthConfig'

/** Get the human-readable label for a content-width mode. */
export function getContentWidthLabel(width: ContentWidth): string {
  return (CONTENT_WIDTH_CONFIG[width] ?? CONTENT_WIDTH_CONFIG[DEFAULT_CONTENT_WIDTH]).label
}
