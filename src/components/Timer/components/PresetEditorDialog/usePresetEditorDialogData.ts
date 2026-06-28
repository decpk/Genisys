import { useCallback, useEffect, useState } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('timer')

import { useTimerStore } from '@/store/timer-store'
import type { TimerMode } from '@/store/timer-store/timer-store.types'

import type {
  PresetEditorDialogProps,
  PresetEditorFormState,
} from './PresetEditorDialog.types'
import { buildAddPresetInput } from './utils/buildAddPresetInput'
import { buildUpdatePresetInput } from './utils/buildUpdatePresetInput'
import { formStateFromSource } from './utils/formStateFromSource'
import { initialFormState } from './utils/initialFormState'
import { validateForm } from './utils/validateForm'

export interface UsePresetEditorDialogDataReturn {
  form: PresetEditorFormState
  submitLabel: string
  setLabel: (v: string) => void
  setMode: (v: TimerMode) => void
  setWorkSec: (v: number) => void
  setBreakSec: (v: number) => void
  setIconKey: (v: string) => void
  setTagline: (v: string) => void
  setDescription: (v: string) => void
  setBestFor: (v: string[]) => void
  setThemeId: (v: string) => void
  setSoundProfileId: (v: string) => void
  setAutoStartBreak: (v: boolean) => void
  submit: () => boolean
}

const SUBMIT_LABELS: Record<PresetEditorDialogProps['mode'], string> = {
  create: 'Create',
  edit: 'Save',
  duplicate: 'Duplicate',
}

const SUCCESS_TOASTS: Record<PresetEditorDialogProps['mode'], string> = {
  create: 'Preset created',
  edit: 'Preset updated',
  duplicate: 'Preset duplicated',
}

export function usePresetEditorDialogData(
  props: Pick<PresetEditorDialogProps, 'open' | 'mode' | 'source'>,
): UsePresetEditorDialogDataReturn {
  const { open, mode, source } = props
  const [form, setForm] = useState<PresetEditorFormState>(() =>
    source ? formStateFromSource(source) : initialFormState(),
  )

  const addPreset = useTimerStore((s) => s.addPreset)
  const updatePreset = useTimerStore((s) => s.updatePreset)
  const duplicatePreset = useTimerStore((s) => s.duplicatePreset)

  // Reset / reseed the form whenever the dialog opens.
  useEffect(() => {
    if (!open) return
    if (source) setForm(formStateFromSource(source))
    else setForm(initialFormState())
  }, [open, source])

  const update = useCallback(
    <K extends keyof PresetEditorFormState>(
      key: K,
      value: PresetEditorFormState[K],
    ) => setForm((prev) => ({ ...prev, [key]: value })),
    [],
  )

  const submit = useCallback((): boolean => {
    const error = validateForm(form)
    if (error) {
      toast.error(error)
      return false
    }
    if (mode === 'edit') {
      if (!source?.customId) {
        toast.error('Cannot save: missing preset id.')
        return false
      }
      updatePreset(buildUpdatePresetInput(source.customId, form))
    } else if (mode === 'duplicate') {
      duplicatePreset(buildAddPresetInput(form))
    } else {
      addPreset(buildAddPresetInput(form))
    }
    toast.success(SUCCESS_TOASTS[mode])
    return true
  }, [form, mode, source, addPreset, updatePreset, duplicatePreset])

  return {
    form,
    submitLabel: SUBMIT_LABELS[mode],
    setLabel: (v) => update('label', v),
    setMode: (v) => update('mode', v),
    setWorkSec: (v) => update('workSec', v),
    setBreakSec: (v) => update('breakSec', v),
    setIconKey: (v) => update('iconKey', v),
    setTagline: (v) => update('tagline', v),
    setDescription: (v) => update('description', v),
    setBestFor: (v) => update('bestFor', v),
    setThemeId: (v) => update('themeId', v),
    setSoundProfileId: (v) => update('soundProfileId', v),
    setAutoStartBreak: (v) => update('autoStartBreak', v),
    submit,
  }
}
