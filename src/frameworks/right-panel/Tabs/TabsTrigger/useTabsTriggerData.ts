import * as React from 'react'

import { useTabs } from '../useTabsData'

export function useTabsTriggerData(value: string) {
  const { value: selectedValue, onValueChange, registerTab, iconsOnly } = useTabs()
  const isActive = selectedValue === value
  const showIconOnly = iconsOnly

  const ref = React.useCallback(
    (el: HTMLButtonElement | null) => {
      registerTab(value, el)
    },
    [registerTab, value],
  )

  const handleClick = React.useCallback(() => {
    onValueChange(value)
  }, [onValueChange, value])

  const dataState = isActive ? 'active' : 'inactive'

  return { isActive, showIconOnly, ref, handleClick, dataState }
}
