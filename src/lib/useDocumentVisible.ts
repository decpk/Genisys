import { useEffect, useState } from 'react'

/**
 * Returns whether the document is currently visible. Listens to
 * `visibilitychange`. Use to gate expensive periodic work so the app
 * stops doing it when minimized / in background. (Perf P11.)
 */
export function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
  )

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}
