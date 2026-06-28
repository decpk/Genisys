import { useCallback, useState } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { rescan as rescanApi } from '@/components/Messages/api/rescan'
import { rotateIdentity } from '@/components/Messages/api/rotateIdentity'
import { setDisplayName } from '@/components/Messages/api/setDisplayName'
import { setOffline } from '@/components/Messages/api/setOffline'
import { formatFingerprint } from '@/components/Messages/utils/formatFingerprint'
import { copyToClipboard } from '@/lib/clipboard'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useMessagesStore } from '@/store/messages-store'

import type { IdentityCardData } from './IdentityCard.types'

const MASK_NAME = '••••••••'
const MASK_ID = '•••• •••• ••••'
const MASK_ADDRESS = '•••••••••••••'

export function useIdentityCardData(): IdentityCardData {
  const identity = useMessagesStore((s) => s.identity)
  const setIdentity = useMessagesStore((s) => s.setIdentity)
  const clearDiscoveredPeers = useMessagesStore((s) => s.clearDiscoveredPeers)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [nameRevealed, setNameRevealed] = useState(false)
  const [idRevealed, setIdRevealed] = useState(false)
  const [addressRevealed, setAddressRevealed] = useState(false)
  const [offlineBusy, setOfflineBusy] = useState(false)
  const [rescanBusy, setRescanBusy] = useState(false)

  const startEdit = useCallback(() => {
    setDraftName(identity?.displayName ?? '')
    setIsEditing(true)
  }, [identity])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  const commitName = useCallback(async () => {
    const next = draftName.trim()
    setIsEditing(false)
    if (!next || next === identity?.displayName) return
    try {
      const updated = await setDisplayName(next)
      setIdentity(updated)
    } catch (e) {
      console.error('[messages] failed to set display name:', e)
    }
  }, [draftName, identity, setIdentity])

  const fullFingerprint = formatFingerprint(identity?.fingerprint ?? '')
  const shortFingerprint = fullFingerprint.split(' ').slice(0, 3).join(' ')

  // When online the listener is bound, so we have a full `host:port` connect
  // address. When offline (invisible) there is no listener and `listenPort` is
  // 0 — but we still know our LAN IP, so surface that instead of leaving the
  // card blank. `addressListening` lets the UI clarify that peers can't connect
  // until you go online.
  const addressListening = (identity?.listenPort ?? 0) > 0
  const connectAddress = identity?.localIp
    ? addressListening
      ? `${identity.localIp}:${identity.listenPort}`
      : identity.localIp
    : null

  const toggleNameReveal = useCallback(() => {
    setNameRevealed((prev) => !prev)
  }, [])

  const toggleIdReveal = useCallback(() => {
    setIdRevealed((prev) => !prev)
  }, [])

  const toggleAddressReveal = useCallback(() => {
    setAddressRevealed((prev) => !prev)
  }, [])

  const copyAddress = useCallback(() => {
    if (!connectAddress) return
    copyToClipboard(connectAddress, 'Your address')
  }, [connectAddress])

  const isOffline = identity?.offline ?? false

  const toggleOffline = useCallback(
    async (nextOffline: boolean) => {
      setOfflineBusy(true)
      try {
        const updated = await setOffline(nextOffline)
        setIdentity(updated)
        if (nextOffline) {
          clearDiscoveredPeers()
          toast.success("You're offline — no one can discover you")
        } else {
          toast.success("You're online and discoverable again")
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        toast.error(`Couldn't change visibility: ${message}`)
      } finally {
        setOfflineBusy(false)
      }
    },
    [setIdentity, clearDiscoveredPeers]
  )

  const rescan = useCallback(async () => {
    setRescanBusy(true)
    try {
      const updated = await rescanApi()
      setIdentity(updated)
      clearDiscoveredPeers()
      toast.success('Scanning your network for peers…')
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      toast.error(`Couldn't rescan: ${message}`)
    } finally {
      setRescanBusy(false)
    }
  }, [setIdentity, clearDiscoveredPeers])

  const rotate = useCallback(() => {
    openConfirmDialog({
      title: 'Rotate your address?',
      description:
        'This generates a brand-new identity and address. Your old address stops working and anyone you previously shared it with can no longer reach you. Verified peers will need to verify you again. Existing open chats keep working.',
      confirmLabel: 'Rotate',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          const updated = await rotateIdentity()
          setIdentity(updated)
          clearDiscoveredPeers()
          toast.success('Your address has been rotated')
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e)
          toast.error(`Couldn't rotate address: ${message}`)
        }
      },
    })
  }, [openConfirmDialog, setIdentity, clearDiscoveredPeers])

  const nameText = nameRevealed ? identity?.displayName ?? '' : MASK_NAME
  const idText = idRevealed ? shortFingerprint : MASK_ID
  let addressText: string | null = null
  if (connectAddress) {
    addressText = addressRevealed ? connectAddress : MASK_ADDRESS
  }

  return {
    identity,
    isEditing,
    draftName,
    nameRevealed,
    idRevealed,
    addressRevealed,
    isOffline,
    offlineBusy,
    nameText,
    idText,
    addressText,
    addressListening,
    startEdit,
    cancelEdit,
    setDraftName,
    commitName,
    toggleNameReveal,
    toggleIdReveal,
    toggleAddressReveal,
    copyAddress,
    rescan,
    rescanBusy,
    rotate,
    toggleOffline,
  }
}
