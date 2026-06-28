import { getBaseName } from '../../../utils/getBaseName'
import { addCopySuffix } from '../../../utils/addCopySuffix'
import { getClipboard, clearClipboard } from '../clipboardState'

const ALREADY_EXISTS = 'already exists'
const MAX_RENAME_ATTEMPTS = 50

/**
 * Paste the clipboard item into `targetFolder` (relative to `targetRootPath`).
 *
 * The source may live under a *different* root than the paste destination, so
 * the source's own root (`entry.rootPath`) is forwarded separately. If the
 * destination name already exists, a Finder-style " copy" suffix is appended
 * until a free name is found instead of failing.
 */
export async function handlePaste(
  targetRootPath: string,
  targetFolder: string,
  operationId?: string
): Promise<void> {
  const entry = getClipboard()
  if (!entry) return

  const isFolder = entry.item.isFolder
  const itemName = getBaseName(entry.item.path)
  let destination = targetFolder === '/' ? itemName : `${targetFolder}/${itemName}`

  const run = (dest: string): Promise<{ success: boolean; error?: string }> =>
    entry.mode === 'cut'
      ? (window.api.moveItem(targetRootPath, entry.item.path, dest, entry.rootPath) as Promise<{
          success: boolean
          error?: string
        }>)
      : (window.api.copyItem(
          targetRootPath,
          entry.item.path,
          dest,
          entry.rootPath,
          operationId
        ) as Promise<{
          success: boolean
          error?: string
        }>)

  let result = await run(destination)

  // On a name collision, auto-rename instead of surfacing an error.
  let attempts = 0
  while (
    !result.success &&
    (result.error?.toLowerCase().includes(ALREADY_EXISTS) ?? false) &&
    attempts < MAX_RENAME_ATTEMPTS
  ) {
    destination = addCopySuffix(destination, isFolder)
    result = await run(destination)
    attempts += 1
  }

  if (!result.success) {
    throw new Error(result.error ?? `Failed to ${entry.mode === 'cut' ? 'move' : 'copy'}`)
  }

  if (entry.mode === 'cut') clearClipboard()
}
