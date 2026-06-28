import { Pencil, Pin, TerminalSquare, X } from 'lucide-react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'

import { terminalStyles } from '../../Terminal.styles'
import type { TerminalTabProps } from '../../Terminal.types'

export function TerminalTab(props: TerminalTabProps) {
  function onClick() {
    props.onActivate(props.id)
  }
  function onCloseClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    props.onClose(props.id)
  }
  function onPinClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    props.onTogglePin?.(props.id)
  }
  function onAuxDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button === 1) {
      e.preventDefault()
      props.onClose(props.id)
    }
  }
  function onDoubleClick() {
    props.onRename?.(props.id)
  }

  const className = cn(
    terminalStyles.tab,
    props.active ? terminalStyles.tabActive : '',
    props.exited ? terminalStyles.tabExited : ''
  )
  const closeClassName = cn(
    terminalStyles.tabClose,
    props.active ? terminalStyles.tabCloseActive : ''
  )
  const pinClassName = cn(
    terminalStyles.tabPin,
    props.pinned ? terminalStyles.tabPinActive : ''
  )
  const iconClassName = props.exited ? terminalStyles.tabIconExited : terminalStyles.tabIcon

  let badge: React.ReactNode = null
  if (props.exited) {
    const exitLabel = props.exitCode !== null ? `exit ${props.exitCode}` : 'exited'
    badge = <span className={terminalStyles.tabBadge}>{exitLabel}</span>
  }

  const canPin = Boolean(props.onTogglePin)
  const canRename = Boolean(props.onRename)
  const canShowMenu = canPin || canRename

  const tab = (
    <div
      role="tab"
      aria-selected={props.active}
      className={className}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onAuxDown}
    >
      <TerminalSquare className={iconClassName} aria-hidden="true" />
      <span className={terminalStyles.tabTitle}>{props.title}</span>
      {badge}
      {canPin && (
        <button
          type="button"
          className={pinClassName}
          onClick={onPinClick}
          aria-label={props.pinned ? `Unpin ${props.title}` : `Pin ${props.title}`}
          aria-pressed={props.pinned}
          tabIndex={-1}
        >
          <Pin className={cn('w-2.5 h-2.5', props.pinned ? 'fill-current' : '')} />
        </button>
      )}
      <button
        type="button"
        className={closeClassName}
        onClick={onCloseClick}
        aria-label={`Close ${props.title}`}
        tabIndex={-1}
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  )

  if (!canShowMenu) return tab

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{tab}</ContextMenuTrigger>
      <ContextMenuContent>
        {canRename && (
          <ContextMenuItem onSelect={() => props.onRename?.(props.id)}>
            <Pencil />
            Rename Tab…
          </ContextMenuItem>
        )}
        {canPin && (
          <ContextMenuItem onSelect={() => props.onTogglePin?.(props.id)}>
            <Pin className={props.pinned ? 'fill-current' : ''} />
            {props.pinned ? 'Unpin Tab' : 'Pin Tab'}
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => props.onClose(props.id)}>
          <X />
          Close Tab
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
