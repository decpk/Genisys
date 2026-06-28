import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import type { CallKind } from '@/components/Messages/Messages.types'

import { MediaAccessError } from './mediaAccessError'

/**
 * Shows a user-facing toast for a failed call attempt. When the failure is a
 * permission denial, the toast offers an "Open Settings" action that jumps
 * straight to the relevant macOS privacy pane.
 *
 * `phase` selects the generic fallback copy used for non-media errors, matching
 * the wording the Messages app shipped with previously.
 */
export function notifyCallMediaError(
  err: unknown,
  kind: CallKind,
  phase: 'start' | 'join'
): void {
  if (err instanceof MediaAccessError) {
    const canOpenSettings =
      err.reason === 'denied' &&
      typeof window !== 'undefined' &&
      typeof window.api?.openPrivacySettings === 'function'

    if (canOpenSettings) {
      const pane = err.privacyPane
      toast.error(err.message, {
        action: {
          label: 'Open Settings',
          onClick: () => {
            void window.api.openPrivacySettings(pane)
          },
        },
      })
    } else {
      toast.error(err.message)
    }
    return
  }

  toast.error(
    phase === 'start'
      ? 'Could not start the call — check microphone/camera access'
      : 'Could not join the call — check microphone/camera access'
  )
}
