import { useEffect, useState, useCallback } from 'react'
import { useClipboardStore } from '@/store/clipboard-store'
import { resolveClipboardVisionModel } from '@/lib/resolveAppModel'
import type { ImageDescriptionPaneProps } from '../ImageDescriptionPane.types'

export function useImageDescriptionPaneData(props: ImageDescriptionPaneProps) {
  const { itemId, imagePath, imageDescription } = props

  const updateImageDescription = useClipboardStore((s) => s.updateImageDescription)
  const updateItemAnalysis = useClipboardStore((s) => s.updateItemAnalysis)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  // Reset edit state when item changes
  useEffect(() => {
    setIsEditing(false)
  }, [itemId])

  const handleStartEdit = useCallback(() => {
    setEditValue(imageDescription ?? '')
    setIsEditing(true)
  }, [imageDescription])

  const handleSave = useCallback(() => {
    updateImageDescription(itemId, editValue)
    setIsEditing(false)
  }, [updateImageDescription, itemId, editValue])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleRetry = useCallback(() => {
    if (imagePath) {
      updateItemAnalysis(itemId, null, 'pending')
      window.api.analyzeClipboardImage(itemId, imagePath, resolveClipboardVisionModel())
    }
  }, [updateItemAnalysis, itemId, imagePath])

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
