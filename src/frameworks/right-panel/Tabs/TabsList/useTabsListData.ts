import * as React from 'react'

import { useTabs } from '../useTabsData'

export function useTabsListData() {
  const { value, listRef, iconsOnly } = useTabs();
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0, top: 0, height: 0, opacity: 0 })

  const updateIndicator = React.useCallback(() => {
    const list = listRef.current
    if (!list) return

    const activeBtn = list.querySelector<HTMLButtonElement>('[data-state="active"]')
    if (!activeBtn) return

    const listRect = list.getBoundingClientRect()
    const btnRect = activeBtn.getBoundingClientRect()

    setIndicator({
      left: btnRect.left - listRect.left + list.scrollLeft,
      width: btnRect.width,
      top: btnRect.top - listRect.top,
      height: btnRect.height,
      opacity: 1,
    })
  }, [listRef])

  React.useLayoutEffect(() => {
    updateIndicator()
  }, [value, iconsOnly, updateIndicator])

  React.useEffect(() => {
    const list = listRef.current
    if (!list) return

    const observer = new ResizeObserver(updateIndicator)
    observer.observe(list)
    return () => observer.disconnect()
  }, [listRef, updateIndicator])

  return { listRef, indicator }
}
