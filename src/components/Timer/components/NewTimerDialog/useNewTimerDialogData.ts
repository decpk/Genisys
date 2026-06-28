import { useCallback, useState } from 'react'

import { useTimerStore } from '@/store/timer-store'
import type { TimerMode } from '@/store/timer-store/timer-store.types'

import { TIMER_THEMES } from '../../constants/timerThemes'
import { TIMER_SOUNDS } from '../../constants/timerSounds'

import type { NewTimerFormState } from './NewTimerDialog.types'

const INITIAL: NewTimerFormState = {
  name: 'New Timer',
  mode: 'pomodoro',
  workSec: 25 * 60,
  shortBreakSec: 5 * 60,
  longBreakSec: 15 * 60,
  themeId: TIMER_THEMES[0].id,
  soundProfileId: TIMER_SOUNDS[0].id,
  tagId: null,
  autoStartBreak: false,
}

export interface UseNewTimerDialogDataReturn {
  form: NewTimerFormState
  tags: ReturnType<typeof useTimerStore.getState>['tags']
  setName: (v: string) => void
  setMode: (v: TimerMode) => void
  setWorkSec: (v: number) => void
  setShortBreakSec: (v: number) => void
  setLongBreakSec: (v: number) => void
  setThemeId: (v: string) => void
  setSoundProfileId: (v: string) => void
  setTagId: (v: string | null) => void
  setAutoStartBreak: (v: boolean) => void
  reset: () => void
  submit: () => string
}

export function useNewTimerDialogData(): UseNewTimerDialogDataReturn {
  const [form, setForm] = useState<NewTimerFormState>(INITIAL)
  const tags = useTimerStore((s) => s.tags)
  const createInstance = useTimerStore((s) => s.createInstance)

  const update = <K extends keyof NewTimerFormState>(key: K, value: NewTimerFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const reset = useCallback(() => setForm(INITIAL), [])

  const submit = useCallback((): string => {
    const id = createInstance({
      name: form.name,
      mode: form.mode,
      durationSec: form.workSec,
      themeId: form.themeId,
      soundProfileId: form.soundProfileId,
      tagId: form.tagId ?? undefined,
    })
    setForm(INITIAL)
    return id
  }, [createInstance, form])

  return {
    form,
    tags,
    setName: (v) => update('name', v),
    setMode: (v) => update('mode', v),
    setWorkSec: (v) => update('workSec', v),
    setShortBreakSec: (v) => update('shortBreakSec', v),
    setLongBreakSec: (v) => update('longBreakSec', v),
    setThemeId: (v) => update('themeId', v),
    setSoundProfileId: (v) => update('soundProfileId', v),
    setTagId: (v) => update('tagId', v),
    setAutoStartBreak: (v) => update('autoStartBreak', v),
    reset,
    submit,
  }
}
