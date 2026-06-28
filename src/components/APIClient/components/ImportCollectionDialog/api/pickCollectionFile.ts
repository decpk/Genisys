import { open } from '@tauri-apps/plugin-dialog'

/**
 * Opens a native file picker for a collection export, then reads its text
 * through the global Tauri bridge. Returns `null` when the user cancels or
 * the file could not be read.
 */
export async function pickCollectionFile(): Promise<{ path: string; content: string } | null> {
  const selected = await open({
    multiple: false,
    filters: [{ name: 'Collections', extensions: ['json', 'yaml', 'yml'] }],
  })

  if (typeof selected !== 'string') return null

  const result = await window.api.readTextFile(selected)
  if (!result.success || result.data === undefined) return null

  return { path: selected, content: result.data }
}
