import { useQuitConfirmStore } from '@/store/quit-confirm-store'

import { isMainWindow } from './isMainWindow'

type UnlistenFn = () => void

const noop: UnlistenFn = () => {}

export async function registerCloseRequestedListener(): Promise<UnlistenFn> {
  try {
    // Quit confirmation is only meaningful on the primary window.
    // Secondary windows (detached apps `app-*`, `debug`, `timemachine`,
    // `prtimemachine`, `timer-focus`) must close natively when the user
    // clicks the macOS red traffic-light button — calling
    // `event.preventDefault()` on them leaves the window stuck open
    // because the `<QuitConfirmModal />` is rendered only by the main
    // `App.tsx` branch and is invisible to detached windows.
    if (!(await isMainWindow())) return noop

    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    const win = getCurrentWindow()
    const unlisten = await win.onCloseRequested((event) => {
      const { confirmedQuit, openQuitConfirm } = useQuitConfirmStore.getState()
      if (confirmedQuit) return
      event.preventDefault()
      openQuitConfirm()
    })
    return unlisten
  } catch {
    return noop
  }
}
