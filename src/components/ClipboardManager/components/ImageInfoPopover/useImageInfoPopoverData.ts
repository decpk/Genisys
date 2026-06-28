import { useState, useCallback } from 'react'
import { useClipboardStore } from '@/store/clipboard-store'
import { resolveClipboardVisionModel } from '@/lib/resolveAppModel'
import type { ImageInfoPopoverProps } from './ImageInfoPopover.types'

export function useImageInfoPopoverData(props: ImageInfoPopoverProps) {
  const { item } = props

  const updateImageDescription = useClipboardStore((s) => s.updateImageDescription)
  const updateItemAnalysis = useClipboardStore((s) => s.updateItemAnalysis)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const handleStartEdit = useCallback(() => {
    setEditValue(item.imageDescription ?? '')
    setIsEditing(true)
  }, [item.imageDescription])

  const handleSave = useCallback(() => {
    updateImageDescription(item.id, editValue)
    setIsEditing(false)
  }, [updateImageDescription, item.id, editValue])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleRetry = useCallback(() => {
    if (item.imagePath) {
      updateItemAnalysis(item.id, null, 'pending')
      window.api.analyzeClipboardImage(item.id, item.imagePath, resolveClipboardVisionModel())
    }
  }, [updateItemAnalysis, item.id, item.imagePath])

  const handleEditValueChange = useCallback((value: string) => {
    setEditValue(value)
  }, [])

  return {
    isEditing,
    editValue,
    handleStartEdit,
    handleSave,
    handleCancel,
    handleRetry,
    handleEditValueChange,
  }
}
