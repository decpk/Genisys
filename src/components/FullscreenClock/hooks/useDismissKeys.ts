import { useEffect } from 'react'

const DISMISS_KEYS = new Set(['Escape', 'Enter', ' '])

export function useDismissKeys(active: boolean, onDismiss: () => void): void {
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent): void => {
      if (!DISMISS_KEYS.has(e.key)) return
      e.preventDefault()
      onDismiss()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [active, onDismiss])
}
