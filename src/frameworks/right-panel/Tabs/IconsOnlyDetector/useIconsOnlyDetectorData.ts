import * as React from 'react'

const BUFFER = 20

export function useIconsOnlyDetectorData(
  listRef: React.RefObject<HTMLDivElement | null>,
  iconsOnly: boolean,
  onToggle: (v: boolean) => void,
) {
  const collapseWidth = React.useRef<number | null>(null)

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const check = () => {
      const container = list.parentElement ?? list
      const availableWidth = container.clientWidth

      if (!iconsOnly) {
        if (list.scrollWidth > availableWidth) {
          collapseWidth.current = availableWidth
          onToggle(true)
        }
      } else {
        if (collapseWidth.current !== null && availableWidth > collapseWidth.current + BUFFER) {
          collapseWidth.current = null
          onToggle(false)
        }
      }
    }

    check()

    const observer = new ResizeObserver(check)
    observer.observe(list.parentElement ?? list)
    observer.observe(list)

    return () => observer.disconnect()
  }, [listRef, iconsOnly, onToggle])
}
