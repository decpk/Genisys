import { useEffect, useRef } from 'react'

import type { QuickShareTrayItem } from '@/components/QuickShare/api'
import {
  onQuickShareClientsChanged,
  onQuickShareTrayChanged,
} from '@/components/QuickShare/api'
import { notify } from '@/frameworks/notification'
import { useQuickShareStore } from '@/store/quickshare-store'

/** Sender id used by items the desktop host shared itself (mirrors the Rust
 *  `HOST_SENDER_ID`). Items from this sender never trigger a "received" toast. */
const HOST_SENDER_ID = '__host__'

/**
 * Wires the QuickShare Tauri event listeners into the store, hydrates the
 * initial status, and raises a desktop notification when a device drops a new
 * file or text into the tray. Mounted once by the `QuickShare` app shell.
 * Zustand setters are stable references, so they are safe as effect deps and the
 * effect runs once on mount.
 */
export function useQuickShareData(): void {
  const refreshStatus = useQuickShareStore((s) => s.refreshStatus)
  const setItems = useQuickShareStore((s) => s.setItems)
  const setClients = useQuickShareStore((s) => s.setClients)

  // Track which tray-item ids we've already seen so each device drop notifies
  // exactly once. The first snapshot seeds silently — so opening the app or
  // reconnecting never replays the existing backlog as fresh notifications.
  const knownIdsRef = useRef<Set<string>>(new Set())
  const seededRef = useRef(false)

  useEffect(() => {
    // Hydrate in case the server is already running (e.g. after a hot reload).
    void refreshStatus()

    const offTray = onQuickShareTrayChanged((items) => {
      notifyReceived(items, knownIdsRef.current, seededRef)
      setItems(items)
    })
    const offClients = onQuickShareClientsChanged((clients) => setClients(clients))

    return () => {
      offTray()
      offClients()
    }
  }, [refreshStatus, setItems, setClients])
}

/** Diff an incoming tray against the seen-ids set and notify for items that a
 *  *device* just added (not the desktop host's own shares). */
function notifyReceived(
  items: QuickShareTrayItem[],
  knownIds: Set<string>,
  seeded: { current: boolean },
): void {
  if (!seeded.current) {
    // First snapshot — seed silently, no notifications for the backlog.
    for (const it of items) knownIds.add(it.id)
    seeded.current = true
    return
  }

  const fresh = items.filter(
    (it) => !knownIds.has(it.id) && it.senderId !== HOST_SENDER_ID,
  )
  // Re-sync the seen set to the current tray (adds new, drops removed ones).
  knownIds.clear()
  for (const it of items) knownIds.add(it.id)

  if (fresh.length === 0) return

  let message: string
  if (fresh.length === 1) {
    const it = fresh[0]
    const from = it.senderLabel ? ` from ${it.senderLabel}` : ''
    message =
      it.kind === 'text' ? `Received text${from}` : `Received ${it.name}${from}`
  } else {
    message = `Received ${fresh.length} items`
  }

  notify({ source: 'quickshare', type: 'success', message })
}
