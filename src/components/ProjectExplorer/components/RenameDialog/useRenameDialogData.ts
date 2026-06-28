import { useState, useCallback, useEffect } from 'react'

import type { RenameDialogProps } from './RenameDialog.types'

export function useRenameDialogData(props: RenameDialogProps) {
  const { currentName, onConfirm, onOpenChange, open } = props
  const [value, setValue] = useState(currentName)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValue(currentName)
      setError('')
      setIsPending(false)
    }
  }, [open, currentName])

  const validate = useCallback(
    (name: string): string => {
      const trimmed = name.trim()
      if (!trimmed) return 'Name cannot be empty'
      if (trimmed.includes('/') || trimmed.includes('\\')) return 'Name cannot contain / or \\'
      if (trimmed === currentName) return 'Name is unchanged'
      return ''
    },
    [currentName]
  )

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue)
      setError(validate(newValue))
    },
    [validate]
  )

  const handleSubmit = useCallback(async () => {
    const validationError = validate(value)
    if (validationError) {
      setError(validationError)
      return
    }
    setIsPending(true)
    try {
      await onConfirm(value.trim())
      onOpenChange(false)
    } finally {
      setIsPending(false)
    }
  }, [value, validate, onConfirm, onOpenChange])

  const isValid = !error && value.trim() !== '' && value.trim() !== currentName

  return { value, isPending, error, isValid, handleChange, handleSubmit }
}
