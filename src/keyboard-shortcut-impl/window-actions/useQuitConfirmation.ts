import { useEffect } from 'react'

import { registerCloseRequestedListener } from './utils/registerCloseRequestedListener'

export function useQuitConfirmation(): void {
  useEffect(() => {
    let unlisten: (() => void) | null = null
    let cancelled = false

    registerCloseRequestedListener().then((fn) => {
      if (cancelled) {
        fn()
        return
      }
      unlisten = fn
    })

    return () => {
      cancelled = true
      if (unlisten) unlisten()
    }
  }, [])
}
