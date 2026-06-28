import { useState, useCallback } from 'react'

import type { NoteScopeOption } from '../Notes.types'

export function useScopeSelectorData(onScopeChange: (scope: NoteScopeOption) => void) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = useCallback(
    (scope: NoteScopeOption) => {
      onScopeChange(scope)
      setIsOpen(false)
    },
    [onScopeChange],
  )

  return { isOpen, setIsOpen, handleSelect }
}
