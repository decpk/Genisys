import { useEffect } from 'react'

import { useNavigationStore } from '@/store/navigation-store'
import { useTerminalAppStore } from '@/store/terminal-app-store'

import {
  focusSurface,
  isSurfaceReady,
  pasteIntoSurface,
} from '../components/TerminalAppSurface/terminalAppSurfacePool'

/** Max animation frames to wait for the new tab's xterm surface to mount. */
const MAX_SURFACE_WAIT_FRAMES = 60
/** Settle delay (ms) after the surface mounts, so the shell reaches its prompt. */
const SHELL_SETTLE_MS = 250

/**
 * Opens a fresh terminal tab and runs a command requested via the navigation
 * store's `pendingTerminalCommand` deep-link (e.g. the AutoReviewer "resume in
 * terminal" chip). Mirrors the Chat `pendingChatPromptContent` consume pattern:
 * handles the cold path (Terminal app mounts because of the request) and the
 * warm path (Terminal already open — caught via store subscription).
 */
export function useConsumePendingTerminalCommand(): void {
  useEffect(() => {
    let cancelled = false

    const run = (command: string): void => {
      // Defer one frame so that, under React StrictMode's mount→unmount→mount
      // double-invoke, the discarded first mount is cancelled before it spawns
      // a tab (the command is consumed + the tab created inside the frame).
      requestAnimationFrame(() => {
        if (cancelled) return
        useNavigationStore.getState().consumeTerminalCommand()

        void useTerminalAppStore
          .getState()
          .createTab()
          .then((sessionId) => {
            if (cancelled || !sessionId) return

            // The xterm surface is created lazily when the new tab's React node
            // mounts, so poll a bounded number of frames before injecting input.
            let frames = 0
            const inject = (): void => {
              if (cancelled) return
              if (isSurfaceReady(sessionId)) {
                window.setTimeout(() => {
                  if (cancelled) return
                  pasteIntoSurface(sessionId, command, { run: true })
                  focusSurface(sessionId)
                }, SHELL_SETTLE_MS)
                return
              }
              if (frames++ >= MAX_SURFACE_WAIT_FRAMES) return
              requestAnimationFrame(inject)
            }
            requestAnimationFrame(inject)
          })
      })
    }

    // Cold path: a command was queued before this app mounted.
    const pending = useNavigationStore.getState().pendingTerminalCommand
    if (pending) run(pending)

    // Warm path: Terminal already open when a new command arrives.
    const unsubscribe = useNavigationStore.subscribe((state, prev) => {
      const next = state.pendingTerminalCommand
      if (next && next !== prev.pendingTerminalCommand) run(next)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])
}
