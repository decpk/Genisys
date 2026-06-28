import { useState, useCallback, useEffect } from 'react'

import type { NewItemDialogProps } from './NewItemDialog.types'

export function useNewItemDialogData(props: NewItemDialogProps) {
  const { onConfirm, onOpenChange, open } = props
  const [value, setValue] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValue('')
      setError('')
      setIsPending(false)
    }
  }, [open])

  const validate = useCallback((name: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return 'Name cannot be empty'
    if (trimmed.includes('/') || trimmed.includes('\\')) return 'Name cannot contain / or \\'
    return ''
  }, [])

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

  const isValid = !error && value.trim() !== ''

  return { value, isPending, error, isValid, handleChange, handleSubmit }
}
