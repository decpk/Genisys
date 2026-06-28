import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import type { SlashCommandItem } from '../extensions/slash-command'

interface SlashCommandMenuProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
}

export interface SlashCommandMenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}

export const SlashCommandMenu = forwardRef<
  SlashCommandMenuHandle,
  SlashCommandMenuProps
>(function SlashCommandMenu({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  // Clamp selectedIndex when items shrinks
  const clamped = items.length > 0 ? selectedIndex % items.length : 0

  const onSelect = useCallback(
    (index: number) => {
      const item = items[index]
      if (item) command(item)
    },
    [items, command],
  )

  useImperativeHandle(ref, () => ({
    onKeyDown: (event: KeyboardEvent) => {
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
  }))

  useEffect(() => {
    const el = menuRef.current?.querySelector('[data-selected="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [clamped])

  if (items.length === 0) {
    return (
      <div className="slash-command-menu">
        <div className="slash-command-empty">No results</div>
      </div>
    )
  }

  return (
    <div ref={menuRef} className="slash-command-menu">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={`slash-command-item ${index === clamped ? 'is-selected' : ''}`}
          data-selected={index === clamped}
          onClick={() => onSelect(index)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <span className="slash-command-icon">{item.icon}</span>
          <span className="slash-command-item-body">
            <span className="slash-command-label">{item.label}</span>
            <span className="slash-command-description">
              {item.description}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
})
