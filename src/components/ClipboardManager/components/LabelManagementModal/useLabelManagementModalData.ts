import { useState, useCallback } from 'react'
import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { LABEL_COLOR_OPTIONS } from './LabelManagementModal.constants'

export function useLabelManagementModalData() {
  const labels = useClipboardLabelStore((s) => s.labels)
  const createLabel = useClipboardLabelStore((s) => s.createLabel)
  const updateLabel = useClipboardLabelStore((s) => s.updateLabel)
  const deleteLabel = useClipboardLabelStore((s) => s.deleteLabel)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(LABEL_COLOR_OPTIONS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return
    await createLabel(newName.trim(), newColor)
    setNewName('')
    setNewColor(LABEL_COLOR_OPTIONS[0])
  }, [newName, newColor, createLabel])

  const handleStartEdit = useCallback((id: string, name: string, color: string) => {
    setEditingId(id)
    setEditName(name)
    setEditColor(color)
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editName.trim()) return
    await updateLabel(editingId, editName.trim(), editColor)
    setEditingId(null)
    setEditName('')
    setEditColor('')
  }, [editingId, editName, editColor, updateLabel])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditName('')
    setEditColor('')
  }, [])

  const handleDelete = useCallback(
    (id: string, name: string) => {
      openConfirmDialog({
        title: 'Delete Label',
        description: `Are you sure you want to delete the label "${name}"? It will be removed from all clipboard items.`,
        confirmLabel: 'Delete',
        variant: 'destructive',
        onConfirm: async () => {
          await deleteLabel(id)
        },
      })
    },
    [openConfirmDialog, deleteLabel]
  )

  return {
    labels,
    newName,
    setNewName,
    newColor,
    setNewColor,
    editingId,
    editName,
    setEditName,
    editColor,
    setEditColor,
    handleCreate,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
  }
}
