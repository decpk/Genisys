import type { PresentationWithSlides } from '@/store/webpoint-store/types'

import { exportPresentationHtml } from './exportPresentationHtml'

/**
 * Export the presentation as a standalone HTML file via a native save dialog.
 * The exported file opens in any browser and can be printed to PDF.
 */
export async function downloadPresentationHtml(
  presentation: PresentationWithSlides | null
): Promise<void> {
  if (!presentation) return

  const html = exportPresentationHtml(presentation)
  const { save } = await import('@tauri-apps/plugin-dialog')
  const safeTitle = (presentation.presentation.title || 'presentation').replace(/[^a-z0-9-_ ]/gi, '_')
  const path = await save({
    defaultPath: `${safeTitle}.html`,
    filters: [{ name: 'HTML', extensions: ['html'] }],
  })
  if (!path) return

  const bytes = Array.from(new TextEncoder().encode(html))
  await window.api.writeBinaryFile(path, bytes)
}
