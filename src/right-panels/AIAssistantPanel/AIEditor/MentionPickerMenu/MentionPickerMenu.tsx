import { useEffect, useRef } from 'react'
import { File } from 'lucide-react'

import type { MentionPickerMenuProps } from './MentionPickerMenu.types'

export function MentionPickerMenu({
  items,
  selectedIndex,
  menuLabel,
  onSelect,
  onClose,
}: MentionPickerMenuProps): React.JSX.Element | null {
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  if (items.length === 0) return null

  return (
    <div
      ref={menuRef}
      className="absolute z-50 left-0 bottom-full mb-1 min-w-[220px] max-w-[360px] max-h-[200px] overflow-y-auto rounded-xl border border-border/60 bg-card p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2"
    >
      {menuLabel && (
        <div className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {menuLabel}
        </div>
      )}
      {items.map((item, i) => {
        const Icon = item.icon ?? File
        return (
          <button
            key={item.id}
            ref={(el) => { itemRefs.current[i] = el }}
            onClick={() => onSelect(item)}
            className={`flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-left outline-none transition-colors cursor-pointer ${
              i === selectedIndex
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-secondary/60'
            }`}
          >
            <Icon
              size={13}
              className={`shrink-0 ${i === selectedIndex ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <div className="min-w-0 flex-1">
              <span className="text-[11.5px] font-medium truncate block">
                {item.label}
              </span>
              {item.description && (
                <span className="text-[10px] text-muted-foreground/60 truncate block">
                  {item.description}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
