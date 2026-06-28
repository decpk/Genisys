import { invoke } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'

interface WriteFileResult {
  success: boolean
  data?: { path: string }
  error?: string
}

/**
 * Opens a native save dialog (pre-filled with `defaultName`) and writes the
 * given text content to the chosen path. Returns the saved file path, or
 * `null` when the user cancels the dialog.
 */
export async function saveExportFile(defaultName: string, content: string): Promise<string | null> {
  const filePath = await save({
    defaultPath: defaultName,
    filters: [{ name: 'Genisys Export', extensions: ['json'] }],
  })

  if (!filePath) return null

  const res = await invoke<WriteFileResult>('cmd_code_write_file', {
    path: filePath,
    content,
  })
  if (!res.success) throw new Error(res.error ?? 'Failed to write file')
  return filePath
}
