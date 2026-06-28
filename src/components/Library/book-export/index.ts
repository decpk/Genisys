export type { ExportFormat, ExportOptions, ExportChapter } from './types'
export { exportRegistry } from './registry'

// ─── Register built-in export formats ───────────────────────────
// To add a new format, create an exporter in ./exporters/ and
// register it here.

import { save } from '@tauri-apps/plugin-dialog'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import { exportRegistry } from './registry'
import { pdfExporter } from './exporters/pdf-exporter'
import { htmlExporter } from './exporters/html-exporter'

exportRegistry.register(pdfExporter)
exportRegistry.register(htmlExporter)

// ─── Utility: save a Blob to disk via Tauri's native dialog ────
// Returns the saved file path, or null if the user cancelled.

export async function downloadBlob(blob: Blob, filename: string): Promise<string | null> {
  const ext = filename.split('.').pop() ?? ''

  const filePath = await save({
    defaultPath: filename,
    filters: [{ name: ext.toUpperCase(), extensions: [ext] }],
  })

  if (!filePath) return null // user cancelled

  const arrayBuffer = await blob.arrayBuffer()
  const bytes = Array.from(new Uint8Array(arrayBuffer))

  const result = await window.api.writeBinaryFile(filePath, bytes)
  if (!result.success) {
    throw new Error(result.error ?? 'Failed to write file')
  }

  return filePath
}

// ─── Utility: reveal a file in the system's file manager ───────
// Works cross-platform: Finder (macOS), Explorer (Windows), file manager (Linux).

export async function showInFolder(path: string): Promise<void> {
  await revealItemInDir(path)
}
