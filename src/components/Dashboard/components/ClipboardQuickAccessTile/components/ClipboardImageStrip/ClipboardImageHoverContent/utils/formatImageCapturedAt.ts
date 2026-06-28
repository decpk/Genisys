import { formatTimeAgo } from '@/components/ClipboardManager/utils/formatTimeAgo'

import type { ImageCapturedAtLabel } from '../ClipboardImageHoverContent.types'

/**
 * Formats a clipboard item's `createdAt` ISO string into a pair of
 * human-readable labels: an absolute locale-formatted date+time
 * (e.g. "5/6/2026, 3:24:18 PM") and a relative time ("2m ago").
 */
export function formatImageCapturedAt(createdAt: string): ImageCapturedAtLabel {
  const date = new Date(createdAt)
  const absolute = date.toLocaleString()
  const relative = formatTimeAgo(createdAt)
  return { absolute, relative }
}
