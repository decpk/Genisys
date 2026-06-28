import { useEffect, useRef } from 'react'
import { Terminal } from 'lucide-react'

import type { ChatCommand } from '@/store/command-store'

interface CommandMenuProps {
  filtered: ChatCommand[]
  selectedIndex: number
  onSelect: (command: ChatCommand) => void
  onClose: () => void
}

export function CommandMenu({
  filtered,
  selectedIndex,
  onSelect,
  onClose,
}: CommandMenuProps): React.JSX.Element | null {
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Scroll selected item into view
  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  if (filtered.length === 0) return null

  return (
    <div
      ref={menuRef}
      className="absolute z-50 left-0 bottom-full mb-1 min-w-[240px] max-w-[320px] max-h-[240px] overflow-y-auto rounded-xl border border-border/60 bg-card p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2"
    >
      <div className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Commands
      </div>
      {filtered.map((cmd, i) => (
        <button
          key={cmd.id}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          onClick={() => onSelect(cmd)}
          className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-left outline-none transition-colors cursor-pointer ${
            i === selectedIndex
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-secondary/60"
          }`}
        >
          <Terminal size={14} className="shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <span className="font-medium text-[13px]">/{cmd.name}</span>
            <p className="text-[11px] text-muted-foreground truncate">
              {cmd.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
