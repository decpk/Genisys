import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('explorer')

import { ExplorerCopyProgressToast } from '@/components/ExplorerCopyProgressToast'

interface RunWithCopyProgressToastParams {
  title: string
  successMessage: string
  errorMessage: string
  run: (operationId: string) => Promise<void>
}

/**
 * Runs a copy-style filesystem operation while showing a Finder/Explorer-style
 * determinate progress bar toast driven by `explorer-copy-progress` events.
 *
 * Generates an `operationId`, mounts an {@link ExplorerCopyProgressToast} inside
 * a persistent sonner toast, forwards the id into `run`, and swaps the toast for
 * a success/error message when the operation settles.
 */
export async function runWithCopyProgressToast(
  params: RunWithCopyProgressToastParams
): Promise<boolean> {
  const { title, successMessage, errorMessage, run } = params
  const operationId = crypto.randomUUID()

  const toastId = toast.custom(
    () => <ExplorerCopyProgressToast operationId={operationId} title={title} />,
    { duration: Infinity }
  )

  try {
    await run(operationId)
    toast.success(successMessage, { id: toastId })
    return true
  } catch (error) {
    const err = error as Error
    const details = err?.message ? `: ${err.message}` : ''
    toast.error(`${errorMessage}${details}`, { id: toastId })
    return false
  }
}
