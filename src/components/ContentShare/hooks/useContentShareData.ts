import { useEffect } from 'react'

import {
  onContentShareDevicesChanged,
  onContentShareIncoming,
  onContentShareReceived,
} from '@/components/ContentShare/api'
import { notify } from '@/frameworks/notification'
import { useContentShareStore } from '@/store/content-share-store'
import { useLibraryStore } from '@/store/library-store'
import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { useNoteProjectsStore } from '@/store/note-projects-store'
import { useNoteSectionsStore } from '@/store/note-sections-store'
import { useNoteTopicsStore } from '@/store/note-topics-store'
import { useNotesStore } from '@/store/notes-store'

/** Refresh the relevant stores so freshly-received content shows up live. */
async function refreshAfterReceive(kind: 'library' | 'notes'): Promise<void> {
  if (kind === 'library') {
    await useLibraryStore.getState().loadBooks()
    return
  }
  // Force the cached note trees to refetch (their loads guard on `isLoaded`).
  useNoteProjectsStore.setState({ isLoaded: false })
  useNoteNotebooksStore.setState({ isLoaded: false })
  useNoteSectionsStore.setState({ isLoaded: false })
  useNoteTopicsStore.setState({ isLoaded: false })
  useNotesStore.setState({ notesByScope: {} })
  await Promise.all([
    useNoteProjectsStore.getState().loadProjects(),
    useNoteNotebooksStore.getState().loadNotebooks(),
    useNoteSectionsStore.getState().loadSections(),
    useNoteTopicsStore.getState().loadTopics(),
  ])
}

/**
 * Wires the Content Share Tauri events into the store, auto-starts the LAN
 * service so this device can receive shares, and surfaces a toast (plus a live
 * store refresh) whenever a book/notes bundle finishes importing. Mount once at
 * the app root.
 */
export function useContentShareData(): void {
  const enqueueIncoming = useContentShareStore((s) => s.enqueueIncoming)
  const refreshDevices = useContentShareStore((s) => s.refreshDevices)
  const start = useContentShareStore((s) => s.start)

  useEffect(() => {
    // Auto-start the LAN service (idempotent) and wire the live events. No
    // "ran once" ref guard here: under React StrictMode the effect is
    // intentionally mounted → unmounted → remounted, and a guard would let the
    // cleanup tear the listeners down without re-registering them (leaving the
    // service running but with no incoming-offer listener → no approval modal).
    void start()

    const offDevices = onContentShareDevicesChanged(() => {
      void refreshDevices()
    })
    const offIncoming = onContentShareIncoming((payload) => {
      enqueueIncoming(payload)
    })
    const offReceived = onContentShareReceived((payload) => {
      notify({
        source: 'contentshare',
        type: 'success',
        message: `Received “${payload.title}” from ${payload.senderDeviceName}`,
      })
      void refreshAfterReceive(payload.kind)
    })

    return () => {
      offDevices()
      offIncoming()
      offReceived()
    }
  }, [enqueueIncoming, refreshDevices, start])
}
