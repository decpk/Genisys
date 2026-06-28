import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
} from 'react'

import { useMockServerStore } from '@/store/mock-server-store'
import type { ServerItemProps } from './ServerItem.types'

export function useServerItemData(props: ServerItemProps) {
  const { server, isRunning, onClick } = props

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [draftName, setDraftName] = useState(server.name)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const startServer = useMockServerStore((s) => s.startServer)
  const stopServer = useMockServerStore((s) => s.stopServer)
  const deleteServer = useMockServerStore((s) => s.deleteServer)
  const duplicateServer = useMockServerStore((s) => s.duplicateServer)
  const updateServer = useMockServerStore((s) => s.updateServer)
  const selectedServerId = useMockServerStore((s) => s.selectedServerId)
  const setSelectedServerId = useMockServerStore((s) => s.setSelectedServerId)

  const dotClass = isRunning
    ? 'w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20'
    : 'w-2.5 h-2.5 rounded-full bg-muted-foreground/30'

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleRowClick = useCallback(() => {
    if (isRenaming) return
    onClick(server.id)
  }, [isRenaming, onClick, server.id])

  const handleStart = useCallback(() => {
    void startServer(server.id)
  }, [startServer, server.id])

  const handleStop = useCallback(() => {
    void stopServer(server.id)
  }, [stopServer, server.id])

  const handleDuplicate = useCallback(() => {
    void duplicateServer(server.id)
  }, [duplicateServer, server.id])

  const handleStartRename = useCallback(() => {
    setDraftName(server.name)
    setIsRenaming(true)
  }, [server.name])

  const cancelRename = useCallback(() => {
    setDraftName(server.name)
    setIsRenaming(false)
  }, [server.name])

  const commitRename = useCallback(async () => {
    const trimmed = draftName.trim()
    if (!trimmed || trimmed === server.name) {
      setDraftName(server.name)
      setIsRenaming(false)
      return
    }
    await updateServer(server.id, trimmed, server.port, server.project_id)
    setIsRenaming(false)
  }, [
    draftName,
    server.id,
    server.name,
    server.port,
    server.project_id,
    updateServer,
  ])

  const handleRenameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation()
      if (e.key === 'Enter') {
        e.preventDefault()
        void commitRename()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancelRename()
      }
    },
    [commitRename, cancelRename],
  )

  const handleEditServer = useCallback(() => {
    setShowEditDialog(true)
  }, [])

  const handleRequestDelete = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleDeleteServer = useCallback(async () => {
    try {
      if (selectedServerId === server.id) {
        setSelectedServerId(null)
      }
      await deleteServer(server.id)
      setShowDeleteConfirm(false)
    } catch {
      // deleteServer already surfaced the error via toast; keep the
      // confirmation dialog open so the failure is visible to the user.
    }
  }, [server.id, selectedServerId, deleteServer, setSelectedServerId])

  return {
    showEditDialog,
    setShowEditDialog,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isRenaming,
    draftName,
    setDraftName,
    inputRef,
    dotClass,
    handleRowClick,
    handleStart,
    handleStop,
    handleDuplicate,
    handleStartRename,
    commitRename,
    handleRenameKeyDown,
    handleEditServer,
    handleRequestDelete,
    handleDeleteServer,
  }
}
