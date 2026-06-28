import { useCallback, useState } from 'react'

import type { AgendaAddTaskProps } from '../AgendaAddTask.types'

export interface UseAgendaAddTaskDataResult {
  /** Current input value. */
  value: string
  /** Whether the trimmed value is non-empty and can be submitted. */
  canSubmit: boolean
  /** Controlled input change handler. */
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Form submit handler — adds the task and clears the input. */
  handleSubmit: (event: React.FormEvent) => void
}

/**
 * Logic layer for the `AgendaAddTask` composer. Owns the local input state and
 * the submit flow (validate → delegate to `onAdd` → reset).
 */
export function useAgendaAddTaskData(
  onAdd: AgendaAddTaskProps['onAdd']
): UseAgendaAddTaskDataResult {
  const [value, setValue] = useState('')
  const canSubmit = value.trim().length > 0

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value)
    },
    []
  )

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      const trimmed = value.trim()
      if (!trimmed) return
      void onAdd(trimmed)
      setValue('')
    },
    [value, onAdd]
  )

  return { value, canSubmit, handleChange, handleSubmit }
}
