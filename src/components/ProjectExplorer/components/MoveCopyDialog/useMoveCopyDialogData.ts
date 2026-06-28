import { useState, useCallback, useEffect } from 'react'

import type { RepoItem } from '../../../ProjectExplorer.types'
import { getParentPath } from '../../utils/getParentPath'
import { loadFolderChildren } from './api/loadFolderChildren'
import type { MoveCopyDialogProps } from './MoveCopyDialog.types'

export function useMoveCopyDialogData(props: MoveCopyDialogProps) {
  const { rootPath, itemPath, isFolder, onConfirm, onOpenChange, open } = props
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [rootFolders, setRootFolders] = useState<RepoItem[]>([])
  const [isPending, setIsPending] = useState(false)
  const [loading, setLoading] = useState(false)

  const disabledPath = isFolder ? itemPath : null

  useEffect(() => {
    if (!open) return
    setSelectedPath(null)
    setIsPending(false)
    setLoading(true)
    loadFolderChildren(rootPath, '/').then((folders) => {
      setRootFolders(folders)
      setLoading(false)
    })
  }, [open, rootPath])

  const handleSelect = useCallback((path: string) => {
    setSelectedPath(path)
  }, [])

  const handleSelectRoot = useCallback(() => {
    setSelectedPath('/')
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!selectedPath) return
    setIsPending(true)
    try {
      await onConfirm(selectedPath)
      onOpenChange(false)
    } finally {
      setIsPending(false)
    }
  }, [selectedPath, onConfirm, onOpenChange])

  const parentPath = getParentPath(itemPath)
  const isValid = selectedPath !== null && selectedPath !== parentPath

  return {
    selectedPath,
    rootFolders,
    isPending,
    loading,
    disabledPath,
    isValid,
    handleSelect,
    handleSelectRoot,
    handleConfirm
  }
}
