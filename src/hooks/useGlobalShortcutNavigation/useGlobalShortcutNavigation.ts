import { useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'

export function useGlobalShortcutNavigation(navigateToClipboard: () => void): void {
  useEffect(() => {
    const unlisten = listen('navigate-to-clipboard', () => {
      navigateToClipboard()
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [navigateToClipboard])
}
