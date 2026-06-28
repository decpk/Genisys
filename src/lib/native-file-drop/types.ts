/**
 * A file delivered via the HTML5 drag-and-drop API after a user drops it from
 * the OS file system onto the webview.
 *
 * `path` is best-effort: on Tauri 2 + wry (macOS) the dropped `File` object is
 * patched to expose the absolute filesystem path, but in a plain browser dev
 * build (`npm run dev`) or on platforms where wry has not patched the prototype
 * `path` will be `null`. Consumers must handle `path === null` gracefully.
 */
export interface NativeDroppedFile {
  /** Absolute OS path if available, else `null` (browser dev or unsupported platform). */
  path: string | null
  /** File name (always available). */
  name: string
  /** The raw browser `File` object — useful when no path is available and you need to read content. */
  file: File
}
