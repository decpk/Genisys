import type { NativeDroppedFile } from './types'

/**
 * Extract a best-effort filesystem path + name from a browser `File` object.
 *
 * On Tauri 2 + wry (macOS / Windows / Linux), when the window is configured
 * with `"dragDropEnabled": false`, OS-dropped files arrive as standard HTML5
 * `File` instances in `event.dataTransfer.files`. Wry patches the `File`
 * prototype to expose the absolute filesystem path on the non-standard `.path`
 * property. In a plain browser dev build this property is absent and we
 * return `null` — consumers must handle that gracefully.
 */
export function nativeFileFromDataTransfer(file: File): NativeDroppedFile {
  const path = typeof (file as unknown as { path?: unknown }).path === 'string'
    ? (file as unknown as { path: string }).path
    : null
  return {
    path,
    name: file.name,
    file,
  }
}
