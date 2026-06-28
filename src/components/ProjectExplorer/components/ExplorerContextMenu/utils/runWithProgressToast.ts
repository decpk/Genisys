import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('explorer')

interface RunWithProgressToastParams {
  loadingMessage: string
  successMessage: string
  errorMessage: string
  run: () => Promise<void>
}

export async function runWithProgressToast(params: RunWithProgressToastParams): Promise<boolean> {
  const { loadingMessage, successMessage, errorMessage, run } = params
  const toastId = toast.loading(loadingMessage)

  try {
    await run()
    toast.success(successMessage, { id: toastId })
    return true
  } catch (error) {
    const err = error as Error
    const details = err?.message ? `: ${err.message}` : ''
    toast.error(`${errorMessage}${details}`, { id: toastId })
    return false
  }
}
