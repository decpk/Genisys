import type {
  ResolveToolConfirmationOutcome,
  ResolveToolConfirmationParams,
} from './resolveToolConfirmation.types'

const CANCELLED_MESSAGE = 'User cancelled the action.'
const DEFAULT_ERROR_MESSAGE = 'Confirmed action failed'

/**
 * Centralised handler for the `confirm-required` branch of every AI
 * Assistant runner. When `isAutoApprove()` returns true (e.g. agent
 * mode), the user-facing approval panel is bypassed and the tool's
 * `executeAfterConfirm` runs directly. Otherwise the standard
 * `onConfirmRequired` round-trip is used.
 */
export async function resolveToolConfirmation(
  params: ResolveToolConfirmationParams,
): Promise<ResolveToolConfirmationOutcome> {
  const { confirmAction, executeAfterConfirm, onConfirmRequired, isAutoApprove } = params

  const autoApproved = isAutoApprove?.() === true
  let confirmed: boolean
  if (autoApproved) confirmed = true
  else confirmed = await onConfirmRequired(confirmAction)

  if (!confirmed) {
    return { status: 'cancelled', message: CANCELLED_MESSAGE }
  }

  try {
    const message = await executeAfterConfirm()
    return { status: 'confirmed', message }
  } catch (err) {
    const message = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE
    return { status: 'error', message }
  }
}
