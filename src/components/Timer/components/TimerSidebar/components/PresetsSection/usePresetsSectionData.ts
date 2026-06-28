import { useCallback, useState } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('timer')

import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useTimerStore } from '@/store/timer-store'

import { useAllPresets } from '../../../../hooks/useAllPresets'
import type { PresetGroups, PresetRow } from '../../../../hooks/useAllPresets.types'
import type {
  PresetEditorMode,
  PresetEditorSource,
} from '../../../PresetEditorDialog'

import type {
  PresetRowAction,
  PresetRowActionHandler,
} from './PresetsSection.actions.types'
import { rowToEditorSource } from './utils/rowToEditorSource'

interface EditorState {
  open: boolean
  mode: PresetEditorMode
  source?: PresetEditorSource
}

const CLOSED_EDITOR: EditorState = { open: false, mode: 'create' }

export interface UsePresetsSectionDataReturn {
  groups: PresetGroups
  editor: EditorState
  setEditorOpen: (open: boolean) => void
  openCreate: () => void
  handleAction: PresetRowActionHandler
}

export function usePresetsSectionData(): UsePresetsSectionDataReturn {
  const groups = useAllPresets()
  const removePreset = useTimerStore((s) => s.removePreset)
  const togglePresetPin = useTimerStore((s) => s.togglePresetPin)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [editor, setEditor] = useState<EditorState>(CLOSED_EDITOR)

  const openCreate = useCallback(() => {
    setEditor({ open: true, mode: 'create' })
  }, [])

  const setEditorOpen = useCallback((open: boolean) => {
    if (open) return
    setEditor(CLOSED_EDITOR)
  }, [])

  const handleEdit = useCallback((row: PresetRow) => {
    setEditor({ open: true, mode: 'edit', source: rowToEditorSource(row) })
  }, [])

  const handleDuplicate = useCallback((row: PresetRow) => {
    setEditor({
      open: true,
      mode: 'duplicate',
      source: { ...rowToEditorSource(row), customId: undefined },
    })
  }, [])

  const handleTogglePin = useCallback(
    (row: PresetRow) => {
      togglePresetPin(row.preset.id)
    },
    [togglePresetPin],
  )

  const handleDelete = useCallback(
    (row: PresetRow) => {
      const name = row.preset.label
      openConfirmDialog({
        title: 'Delete preset',
        description: `Delete preset "${name}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        variant: 'destructive',
        onConfirm: () => {
          removePreset(row.preset.id)
          toast.success('Preset deleted')
        },
      })
    },
    [openConfirmDialog, removePreset],
  )

  const handleAction = useCallback<PresetRowActionHandler>(
    (action: PresetRowAction) => {
      const { type, row } = action
      if (type === 'edit') return handleEdit(row)
      if (type === 'duplicate') return handleDuplicate(row)
      if (type === 'delete') return handleDelete(row)
      if (type === 'togglePin') return handleTogglePin(row)
    },
    [handleEdit, handleDuplicate, handleDelete, handleTogglePin],
  )

  return {
    groups,
    editor,
    setEditorOpen,
    openCreate,
    handleAction,
  }
}
