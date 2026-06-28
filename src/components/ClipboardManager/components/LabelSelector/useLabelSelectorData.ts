import { useState, useCallback } from 'react'
import { useClipboardLabelStore } from '@/store/clipboard-label-store'
import { useClipboardStore } from '@/store/clipboard-store'
import type { ClipboardLabel } from '@/store/clipboard-label-store'

const LABEL_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

export function useLabelSelectorData(itemId: string, assignedLabels: ClipboardLabel[]) {
  const allLabels = useClipboardLabelStore((s) => s.labels)
  const createLabel = useClipboardLabelStore((s) => s.createLabel)
  const storeLabelToItem = useClipboardLabelStore((s) => s.addLabelToItem)
  const storeRemoveLabelFromItem = useClipboardLabelStore((s) => s.removeLabelFromItem)
  const addLabelToItemUI = useClipboardStore((s) => s.addLabelToItem)
  const removeLabelFromItemUI = useClipboardStore((s) => s.removeLabelFromItem)

  const [isOpen, setIsOpen] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')

  const assignedIds = new Set(assignedLabels.map((l) => l.id))

  const handleToggleLabel = useCallback(
    async (label: ClipboardLabel) => {
      if (assignedIds.has(label.id)) {
        removeLabelFromItemUI(itemId, label.id)
        await storeRemoveLabelFromItem(itemId, label.id)
      } else {
        addLabelToItemUI(itemId, label)
        await storeLabelToItem(itemId, label.id)
      }
    },
    [itemId, assignedIds, addLabelToItemUI, removeLabelFromItemUI, storeLabelToItem, storeRemoveLabelFromItem]
  )

  const handleCreateLabel = useCallback(async () => {
    if (!newLabelName.trim()) return
    const color = LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)]
    const label = await createLabel(newLabelName.trim(), color)
    addLabelToItemUI(itemId, label)
    await storeLabelToItem(itemId, label.id)
    setNewLabelName('')
  }, [newLabelName, createLabel, itemId, addLabelToItemUI, storeLabelToItem])

  return {
    allLabels,
    assignedIds,
    isOpen,
    setIsOpen,
    newLabelName,
    setNewLabelName,
    handleToggleLabel,
    handleCreateLabel,
  }
}
