import { useEffect } from 'react'

import { terminalWrite } from '../../../api/terminalWrite'
import { encodeBase64 } from '../../../utils/encodeBase64'
import { terminalOutputBus } from '../../../utils/terminalOutputBus'
import type { XtermBundle } from './useXtermInstance'

/** Wires bidirectional IO between an xterm instance and the PTY session.
 *  - PTY → xterm: subscribe to bus, write bytes.
 *  - xterm → PTY: forward keystrokes via `terminalWrite` (base64-encoded). */
export function useTerminalIO(
  bundleRef: React.RefObject<XtermBundle | null>,
  sessionId: string
): void {
  useEffect(() => {
    const bundle = bundleRef.current
    if (!bundle) return

    const unsubOutput = terminalOutputBus.subscribeOutput(sessionId, (bytes) => {
      bundle.term.write(bytes)
    })

    const dataDisposable = bundle.term.onData((str) => {
      const encoded = encodeBase64(str)
      terminalWrite(sessionId, encoded).catch((err) => {
        console.warn('[Terminal] write failed', err)
      })
    })

    return () => {
      unsubOutput()
      try {
        dataDisposable.dispose()
      } catch {
        /* noop */
      }
    }
  }, [bundleRef, sessionId])
}
