import { useState, useCallback, useEffect } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { DEFAULT_STATUS_TEMPLATE } from '@/right-panels/DailyStatusPanel/constants/defaultTemplate'
import { getInitialContent } from './utils/getInitialContent'
import type { StatusTemplateModalData, StatusTemplateModalActions } from '../StatusTemplateModal.types'

interface UseStatusTemplateModalDataReturn {
  data: StatusTemplateModalData
  actions: StatusTemplateModalActions
}

export function useStatusTemplateModalData(
  open: boolean,
  onOpenChange: (open: boolean) => void,
): UseStatusTemplateModalDataReturn {
  const savedTemplate = useSettingsStore((s) => s.dpStatusTemplate)
  const setDpStatusTemplate = useSettingsStore((s) => s.setDpStatusTemplate)

  const [editingContent, setEditingContent] = useState(() => getInitialContent(savedTemplate))
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (open) {
      const content = getInitialContent(savedTemplate)
      setEditingContent(content)
      setIsDirty(false)
    }
  }, [open, savedTemplate])

  const handleContentChange = useCallback((value: string) => {
    setEditingContent(value)
    setIsDirty(true)
  }, [])

  const handleSave = useCallback(() => {
    const trimmed = editingContent.trim()
    // If the content matches the default, save as null to avoid duplication
    const valueToSave = trimmed === DEFAULT_STATUS_TEMPLATE.trim() ? null : trimmed || null
    setDpStatusTemplate(valueToSave)
    setIsDirty(false)
    onOpenChange(false)
  }, [editingContent, setDpStatusTemplate, onOpenChange])

  const handleResetToDefault = useCallback(() => {
    setEditingContent(DEFAULT_STATUS_TEMPLATE)
    setIsDirty(true)
  }, [])

  const handleRequestClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return {
    data: { editingContent, isDirty, savedTemplate },
    actions: {
      setEditingContent: handleContentChange,
      handleSave,
      handleResetToDefault,
      handleRequestClose,
    },
  }
}
