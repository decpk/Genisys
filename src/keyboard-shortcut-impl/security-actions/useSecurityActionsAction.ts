import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('system')

import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useSecurityLockStore } from '@/store/security-lock-store'
import { useSettingsStore } from '@/store/settings-store'

const SHORTCUT_ID = 'security.lock'

function handleLock(): void {
  const { securityEnabled, securityHash } = useSettingsStore.getState()

  if (!securityEnabled || !securityHash) {
    toast.info('Set up a security password in Settings to lock the app.')
    return
  }

  useSecurityLockStore.getState().lock()
}

export function useSecurityActionsAction(): void {
  useBindShortcutActions({
    [SHORTCUT_ID]: handleLock,
  })
}
