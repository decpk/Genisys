import { CaseSensitive, Check, Palette, Pencil, Pin, X } from 'lucide-react'
import { Fragment } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { TerminalTabProps } from '@/components/Terminal/Terminal.types'
import { MONOSPACE_FONT_OPTIONS } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settings-store'

import {
  findTerminalThemeById,
  TERMINAL_THEME_GROUPS,
  TerminalThemeSwatch,
} from '../../terminalThemes'
import { readableTextColor } from '../../tabColors'
import { terminalAppStyles } from '../../TerminalApp.styles'

/**
 * Flat VS Code / API-Client style tab chip used by the standalone Terminal
 * app. Behaviour mirrors the docked terminal's `TerminalTab` (activate, close,
 * middle-click close, pin, double-click rename, right-click menu); only the
 * presentation differs — flat chips with a `bg-background` active fill and a
 * 2px primary accent bar, all from `terminalAppStyles` theme tokens.
 */
export function TerminalAppTab(props: TerminalTabProps) {
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

  // The active chip blends into its terminal: it takes the SAME background the
  // surface uses (resolveTabTheme → per-tab scheme, else default terminal theme,
  // else the app `--background`, which `bg-background` already matches), plus a
  // luminance-derived text colour so the label stays legible on any theme.
  const defaultThemeId = useSettingsStore((s) => s.terminalDefaultThemeId)
  const effectiveTheme =
    findTerminalThemeById(props.themeId) ?? findTerminalThemeById(defaultThemeId)
  const surfaceBg = props.active ? (effectiveTheme?.colors.background ?? null) : null
  const themed = surfaceBg != null

  const themeStyle: React.CSSProperties | undefined = surfaceBg
    ? { backgroundColor: surfaceBg, color: readableTextColor(surfaceBg) }
    : undefined

  const className = cn(
    terminalAppStyles.tab,
    props.active
      ? themed
        ? ''
        : terminalAppStyles.tabActive
      : terminalAppStyles.tabInactive,
    props.exited ? terminalAppStyles.tabExited : ''
  )
  // On a theme-filled chip the close / pin icons inherit the readable text
  // colour so they stay legible; an active pin keeps its primary accent.
  const closeClassName = cn(
    terminalAppStyles.tabClose,
    props.active ? terminalAppStyles.tabCloseActive : '',
    themed && 'text-inherit hover:text-inherit'
  )
  const pinClassName = cn(
    terminalAppStyles.tabPin,
    props.pinned ? terminalAppStyles.tabPinActive : '',
    themed && !props.pinned && 'text-inherit hover:text-inherit'
  )
  const dotClassName = props.exited ? terminalAppStyles.tabDotExited : terminalAppStyles.tabDot

  let badge: React.ReactNode = null
  if (props.exited) {
    const exitLabel = props.exitCode !== null ? `exit ${props.exitCode}` : 'exited'
    badge = <span className={terminalAppStyles.tabBadge}>{exitLabel}</span>
  }

  const canPin = Boolean(props.onTogglePin)
  const canRename = Boolean(props.onRename)
  const canSetTheme = Boolean(props.onSetTheme)
  const canSetFont = Boolean(props.onSetFont)
  const canShowMenu = canPin || canRename || canSetTheme || canSetFont

  const tab = (
    <div
      role="tab"
      aria-selected={props.active}
      className={className}
      style={themeStyle}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onAuxDown}
    >
      {props.active && (
        <span className={terminalAppStyles.tabAccent} aria-hidden="true" />
      )}
      <span className={dotClassName} aria-hidden="true" />
      <span className={terminalAppStyles.tabTitle}>{props.title}</span>
      {badge}
      <div className={terminalAppStyles.tabActions}>
        {props.pinned && canPin ? (
          // Pinned tab: the pin replaces the close button (VS Code style). A
          // pinned tab can't be closed until unpinned, so this slot toggles the
          // pin off — clicking it unpins, which brings the close (X) back.
          <button
            type="button"
            className={pinClassName}
            onClick={onPinClick}
            aria-label={`Unpin ${props.title}`}
            aria-pressed={true}
            title="Unpin tab"
            tabIndex={-1}
          >
            <Pin className="w-3 h-3 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            className={closeClassName}
            onClick={onCloseClick}
            aria-label={`Close ${props.title}`}
            title="Close tab"
            tabIndex={-1}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
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
        {(canSetTheme || canSetFont) && <ContextMenuSeparator />}
        {canSetTheme && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Palette />
              Terminal Theme
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="max-h-[60vh] overflow-y-auto">
              <ContextMenuItem onSelect={() => props.onSetTheme?.(props.id, null)}>
                <span className="inline-block h-[14px] w-[26px] shrink-0" aria-hidden="true" />
                Default (follow app)
                {!props.themeId && <Check className="ml-auto" />}
              </ContextMenuItem>
              {TERMINAL_THEME_GROUPS.map((group) => (
                <Fragment key={group.group}>
                  <ContextMenuSeparator />
                  <ContextMenuLabel>{group.group}</ContextMenuLabel>
                  {group.themes.map((t) => (
                    <ContextMenuItem
                      key={t.id}
                      onSelect={() => props.onSetTheme?.(props.id, t.id)}
                    >
                      <TerminalThemeSwatch theme={t} />
                      {t.name}
                      {props.themeId === t.id && <Check className="ml-auto" />}
                    </ContextMenuItem>
                  ))}
                </Fragment>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        {canSetFont && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <CaseSensitive />
              Font
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="max-h-[60vh] overflow-y-auto">
              {MONOSPACE_FONT_OPTIONS.map((opt) => {
                const active = (props.fontFamily ?? null) === opt.value
                return (
                  <ContextMenuItem
                    key={opt.label}
                    onSelect={() => props.onSetFont?.(props.id, opt.value)}
                    style={opt.value ? { fontFamily: opt.value } : undefined}
                  >
                    {active ? <Check /> : <span className="inline-block w-[14px]" />}
                    {opt.label}
                  </ContextMenuItem>
                )
              })}
            </ContextMenuSubContent>
          </ContextMenuSub>
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
