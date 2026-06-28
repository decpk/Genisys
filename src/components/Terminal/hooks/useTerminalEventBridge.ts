import { useEffect } from 'react'

import { useTerminalStore } from '@/store/terminal-store'

import { onTerminalExit } from '../api/onTerminalExit'
import { onTerminalOutput } from '../api/onTerminalOutput'
import { decodeBase64 } from '../utils/decodeBase64'
import { terminalOutputBus } from '../utils/terminalOutputBus'

// Module-level ref count so multiple mounters (the docked terminal AND the
// standalone Terminal app) share exactly ONE pair of Tauri listeners. Without
// this, a second mounter would double-decode every chunk and double-write to
// xterm. The first mount installs; the last unmount tears down.
let refCount = 0
let offOutput: (() => void) | null = null
let offExit: (() => void) | null = null

function installBridge(): void {
  if (refCount === 0) {
    offOutput = onTerminalOutput((payload) => {
      const bytes = decodeBase64(payload.data)
      terminalOutputBus.publishOutput(payload.id, bytes)
    })
    offExit = onTerminalExit((payload) => {
      terminalOutputBus.publishExit(payload.id, payload.code)
      // Keep the docked terminal store in sync; this is a no-op for sessions it
      // doesn't own (e.g. the standalone Terminal app's own sessions, which
      // subscribe to `terminalOutputBus` exit directly).
      useTerminalStore.getState().handleSessionExit(payload.id, payload.code)
    })
  }
  refCount += 1
}

function uninstallBridge(): void {
  refCount -= 1
  if (refCount <= 0) {
    refCount = 0
    offOutput?.()
    offExit?.()
    offOutput = null
    offExit = null
  }
}

/** Single global Tauri listener for `terminal-output` / `terminal-exit`.
 *  Fans out to per-session subscribers via `terminalOutputBus`. Idempotent and
 *  ref-counted, so it can be mounted by both the docked terminal and the
 *  standalone Terminal app without duplicating listeners. */
export function useTerminalEventBridge(): void {
  useEffect(() => {
    installBridge()
    return () => uninstallBridge()
  }, [])
}
