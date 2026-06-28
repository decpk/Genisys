import { getCurrentWindow } from '@tauri-apps/api/window'

import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'

import { useQuitConfirmation } from './useQuitConfirmation'
import { handleQuitShortcut } from './utils/handleQuitShortcut'

async function toggleWindowFullScreen(): Promise<void> {
  try {
    const win = getCurrentWindow()
    const isFs = await win.isFullscreen()
    await win.setFullscreen(!isFs)
  } catch {
    /* swallow — non-Tauri context or permission missing */
  }
}

export function useWindowActions(): void {
  useQuitConfirmation()
  useBindShortcutActions({
    'global.toggleWindowFullScreen': () => {
      void toggleWindowFullScreen()
    },
    'global.quitApp': () => {
      handleQuitShortcut()
    },
  })
}
