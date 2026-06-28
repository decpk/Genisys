/**
 * Reveals a stored clipboard image in the system file manager
 * (Finder on macOS, Explorer on Windows, native file manager on Linux).
 *
 * Accepts the bare filename persisted in `ClipboardItem.imagePath`. The
 * Rust backend resolves it to its absolute path inside the app data
 * directory before calling `tauri-plugin-opener`'s `reveal_item_in_dir`.
 *
 * Throws if the backend cannot find the file or fails to invoke the
 * platform reveal action, so callers can surface a toast.
 */
export async function revealClipboardImage(imagePath: string): Promise<void> {
  const result = await window.api.revealClipboardImage(imagePath)
  if (result.success) return
  throw new Error(result.error ?? 'Failed to reveal image in Finder.')
}
