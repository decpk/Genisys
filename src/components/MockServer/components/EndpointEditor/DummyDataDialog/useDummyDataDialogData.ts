import { useState, useMemo, useCallback } from 'react'

import {
  getCategoriesByGroup,
  getCategoryById,
  buildDummyDataJson,
} from '@/components/MockServer/components/EndpointEditor/dummy-data'

import {
  DUMMY_DATA_MIN_COUNT,
  DUMMY_DATA_MAX_COUNT,
  DUMMY_DATA_DEFAULT_COUNT,
  DUMMY_DATA_DEFAULT_CATEGORY_ID,
} from './DummyDataDialog.constants'
import type { DummyDataDialogBodyProps } from './DummyDataDialogBody.types'

function clampCount(value: number): number {
  const safe = Math.floor(value) || DUMMY_DATA_MIN_COUNT
  return Math.min(DUMMY_DATA_MAX_COUNT, Math.max(DUMMY_DATA_MIN_COUNT, safe))
}

export function useDummyDataDialogData(props: DummyDataDialogBodyProps) {
  const { onOpenChange, onApply } = props

  const collectionCategories = useMemo(() => getCategoriesByGroup('collections'), [])
  const responseCategories = useMemo(() => getCategoriesByGroup('responses'), [])

  const [selectedCategoryId, setSelectedCategoryId] = useState(DUMMY_DATA_DEFAULT_CATEGORY_ID)
  const [count, setCount] = useState(DUMMY_DATA_DEFAULT_COUNT)
  const [previewJson, setPreviewJson] = useState(() =>
    buildDummyDataJson(DUMMY_DATA_DEFAULT_CATEGORY_ID, DUMMY_DATA_DEFAULT_COUNT)
  )

  const showCountControl = getCategoryById(selectedCategoryId)?.supportsCount ?? false

  const handleSelectCategory = useCallback(
    (id: string) => {
      setSelectedCategoryId(id)
      setPreviewJson(buildDummyDataJson(id, count))
    },
    [count]
  )

  const handleCountChange = useCallback(
    (next: number) => {
      const clamped = clampCount(next)
      setCount(clamped)
      setPreviewJson(buildDummyDataJson(selectedCategoryId, clamped))
    },
    [selectedCategoryId]
  )

  const handleRegenerate = useCallback(() => {
    setPreviewJson(buildDummyDataJson(selectedCategoryId, count))
  }, [selectedCategoryId, count])

  const canInsert = previewJson.length > 0

  const handleInsert = useCallback(() => {
    if (!previewJson) return
    onApply(previewJson)
    onOpenChange(false)
  }, [previewJson, onApply, onOpenChange])

  const handleCancel = useCallback(() => onOpenChange(false), [onOpenChange])

  return {
    collectionCategories,
    responseCategories,
    selectedCategoryId,
    count,
    showCountControl,
    previewJson,
    canInsert,
    handleSelectCategory,
    handleCountChange,
    handleRegenerate,
    handleInsert,
    handleCancel,
  }
}
