import { useEffect, useState } from 'react'

import {
  onContentShareSendProgress,
  type ContentSharePeer,
  type ContentShareSendProgress,
} from '@/components/ContentShare/api'
import type { ShareTarget } from '@/components/ContentShare/types'
import { notify } from '@/frameworks/notification'
import { useContentShareStore } from '@/store/content-share-store'

interface UseDevicePickerDialogData {
  devices: ContentSharePeer[]
  deviceName: string | null
  sendingDeviceId: string | null
  progress: ContentShareSendProgress | null
  refreshDevices: () => Promise<void>
  handlePick: (device: ContentSharePeer) => Promise<void>
}

/**
 * Drives the device-picker dialog: starts the LAN service + refreshes the peer
 * list when opened, and performs the actual send (book or notes) when a device
 * is chosen, reporting the outcome via toasts.
 */
export function useDevicePickerDialogData(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  target: ShareTarget | null,
): UseDevicePickerDialogData {
  const devices = useContentShareStore((s) => s.devices)
  const deviceName = useContentShareStore((s) => s.deviceName)
  const start = useContentShareStore((s) => s.start)
  const refreshDevices = useContentShareStore((s) => s.refreshDevices)
  const sendBook = useContentShareStore((s) => s.sendBook)
  const sendNotes = useContentShareStore((s) => s.sendNotes)

  const [sendingDeviceId, setSendingDeviceId] = useState<string | null>(null)
  const [progress, setProgress] = useState<ContentShareSendProgress | null>(null)

  useEffect(() => {
    if (!open) return
    void start().then(() => refreshDevices())
  }, [open, start, refreshDevices])

  useEffect(() => {
    if (!open) return
    const off = onContentShareSendProgress((p) => setProgress(p))
    return () => {
      off()
      setProgress(null)
    }
  }, [open])

  const handlePick = async (device: ContentSharePeer): Promise<void> => {
    if (!target || sendingDeviceId) return
    setProgress(null)
    setSendingDeviceId(device.deviceId)
    try {
      const result =
        target.type === 'book'
          ? await sendBook(device.deviceId, target.bookId)
          : await sendNotes(device.deviceId, target.kind, target.id)

      if (result.accepted) {
        notify({
          source: 'contentshare',
          type: 'success',
          message: `Sent “${target.label}” to ${device.deviceName}`,
        })
        onOpenChange(false)
      } else {
        notify({
          source: 'contentshare',
          type: 'info',
          message: `${device.deviceName} declined the share`,
        })
      }
    } catch (err) {
      notify({
        source: 'contentshare',
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to send',
      })
    } finally {
      setSendingDeviceId(null)
      setProgress(null)
    }
  }

  return { devices, deviceName, sendingDeviceId, progress, refreshDevices, handlePick }
}
