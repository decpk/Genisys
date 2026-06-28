import { useCallback, useState } from 'react'

import { connectPeer } from '@/components/Messages/api/connectPeer'
import { parseAddress } from '@/components/Messages/utils/parseAddress'
import { validateHostPort } from '@/components/Messages/utils/validateHostPort'
import { useMessagesStore } from '@/store/messages-store'

import type { ManualConnectDialogData } from './ManualConnectDialog.types'

export function useManualConnectDialogData(): ManualConnectDialogData {
  const upsertPeer = useMessagesStore((s) => s.upsertPeer)
  const setActivePeer = useMessagesStore((s) => s.setActivePeer)

  const [open, setOpen] = useState(false)
  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) {
      setError(null)
      setIsConnecting(false)
    }
  }, [])

  // Auto-split a pasted `host:port` address into the two fields. Falls back to
  // default paste behaviour when the clipboard isn't an address pair.
  const handleAddressPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text')
      const { host: parsedHost, port: parsedPort } = parseAddress(pasted)
      if (parsedHost !== null && parsedPort !== null) {
        e.preventDefault()
        setHost(parsedHost)
        setPort(parsedPort)
        setError(null)
      }
    },
    []
  )

  // Typing/pasting `host:port` directly into the host field also splits out
  // the port so it lands in the right input.
  const handleHostChange = useCallback((value: string) => {
    if (value.includes(':')) {
      const { host: parsedHost, port: parsedPort } = parseAddress(value)
      if (parsedHost !== null && parsedPort !== null) {
        setHost(parsedHost)
        setPort(parsedPort)
        return
      }
    }
    setHost(value)
  }, [])

  const handleConnect = useCallback(async () => {
    const validation = validateHostPort(host, port)
    if (!validation.ok || validation.port === null) {
      setError(validation.error)
      return
    }
    setError(null)
    setIsConnecting(true)
    try {
      const peer = await connectPeer({
        host: host.trim(),
        port: validation.port,
      })
      upsertPeer(peer)
      setActivePeer(peer.id)
      setOpen(false)
      setHost('')
      setPort('')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to connect to peer.'
      setError(message)
    } finally {
      setIsConnecting(false)
    }
  }, [host, port, upsertPeer, setActivePeer])

  return {
    open,
    host,
    port,
    error,
    isConnecting,
    setHost,
    setPort,
    handleHostChange,
    handleAddressPaste,
    handleOpenChange,
    handleConnect,
  }
}
