import { getClipboard } from '../clipboardState'
import { handlePaste } from './handlePaste'
import { runWithProgressToast } from '../utils/runWithProgressToast'
import { runWithCopyProgressToast } from '../utils/runWithCopyProgressToast'

/**
 * Pastes the current explorer clipboard entry into `targetFolder` while showing
 * the appropriate toast: a determinate copy-progress toast for `copy`, or a
 * simple loading toast for `cut` (move). Returns `true` on success.
 *
 * Centralises the cut-vs-copy toast selection so every paste affordance
 * (keyboard shortcut, context menu, toolbar chip) behaves identically.
 */
export async function runExplorerPaste(
  rootPath: string,
  targetFolder: string
): Promise<boolean> {
  const entry = getClipboard()
  if (entry === null) return false

  if (entry.mode === 'cut') {
    return runWithProgressToast({
      loadingMessage: 'Moving item…',
      successMessage: 'Paste completed',
      errorMessage: 'Paste failed',
      run: async () => {
        await handlePaste(rootPath, targetFolder)
      }
    })
  }

  return runWithCopyProgressToast({
    title: 'Pasting…',
    successMessage: 'Paste completed',
    errorMessage: 'Paste failed',
    run: async (operationId) => {
      await handlePaste(rootPath, targetFolder, operationId)
    }
  })
}
