import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { TermGroupId, TermTab } from '@/store/terminal-app-store/types'

import { TerminalAppTab } from '../TerminalAppTab'

import { buildTerminalTabSortableId } from '../TerminalAppDnd/terminalAppDragIds'

interface Props {
  tab: TermTab
  groupId: TermGroupId
  active: boolean
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onTogglePin: (id: string) => void
  onRename: (id: string) => void
  onSetTheme: (id: string, themeId: string | null) => void
  onSetFont: (id: string, fontFamily: string | null) => void
}

/**
 * Drag-and-drop sortable wrapper around a `TerminalAppTab`. The sortable
 * bindings live on a thin flex wrapper so the tab chip itself stays free of
 * dnd-kit concerns. A 5px pointer activation distance keeps plain clicks —
 * activate, close, pin, right-click context menu — working; only a deliberate
 * drag relocates the tab.
 */
export function TerminalAppPaneTabItem({
  tab,
  groupId,
  active,
  onActivate,
  onClose,
  onTogglePin,
  onRename,
  onSetTheme,
  onSetFont,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: buildTerminalTabSortableId(groupId, tab.id) })

  const style: React.CSSProperties = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex shrink-0" {...attributes} {...listeners}>
      <TerminalAppTab
        id={tab.id}
        title={tab.title}
        active={active}
        exited={tab.exited}
        exitCode={tab.exitCode}
        pinned={tab.pinned}
        themeId={tab.themeId}
        fontFamily={tab.fontFamily}
        onActivate={onActivate}
        onClose={onClose}
        onTogglePin={onTogglePin}
        onRename={onRename}
        onSetTheme={onSetTheme}
        onSetFont={onSetFont}
      />
    </div>
  )
}
