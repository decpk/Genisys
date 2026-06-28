import { useState, useCallback, useEffect, useRef } from 'react'
import type { WikiLinkMenuProps } from './WikiLinkMenu.types'

/**
 * Selection + keyboard state for the `[[` autocomplete popup. Returns the
 * clamped active index, a ref for the scroll container, a click handler and the
 * keydown handler the parent exposes via `useImperativeHandle`.
 */
export function useWikiLinkMenuData(props: WikiLinkMenuProps) {
  const { items, command } = props

  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const clamped = items.length > 0 ? selectedIndex % items.length : 0

  const onSelect = useCallback(
    (index: number) => {
      const item = items[index]
      if (item) command(item)
    },
    [items, command],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent): boolean => {
      if (items.length === 0) return false
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % items.length)
        return true
      }
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i - 1 + items.length) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        onSelect(clamped)
        return true
      }
      return false
    },
    [items.length, clamped, onSelect],
  )

  useEffect(() => {
    const el = menuRef.current?.querySelector('[data-selected="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [clamped])

  return { menuRef, clamped, onSelect, onKeyDown, setSelectedIndex }
}
