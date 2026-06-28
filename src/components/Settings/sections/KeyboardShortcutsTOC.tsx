import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import type { ResolvedShortcut, ShortcutScope } from '@/frameworks/keyboard-shortcut'
import {
  navButtonBase,
  navButtonActive,
  navButtonInactive,
} from '../SettingsNavGroup/SettingsNavGroup.styles'

const SCOPE_ID_PREFIX = 'kb-scope-'
const SCOPE_DATA_ATTR = 'data-kb-scope'
const CONFLICTS_ANCHOR_ID = 'kb-conflicts'

export type KeyboardShortcutsTOCProps = {
  groups: Array<[ShortcutScope, ResolvedShortcut[]]>
  scopeLabels: Record<string, string>
  showConflictsLink?: boolean
}

export function KeyboardShortcutsTOC(
  props: KeyboardShortcutsTOCProps,
): React.JSX.Element | null {
  const { groups, scopeLabels, showConflictsLink } = props

  const anchorRef = useRef<HTMLDivElement | null>(null)
  const [activeScope, setActiveScope] = useState<ShortcutScope | null>(null)

  // Derive the effective active scope so stale state from a previously-visible
  // scope doesn't highlight after the filter removes it. This avoids the
  // anti-pattern of calling setState inside an effect just to mirror props.
  const effectiveActive =
    activeScope && groups.some(([scope]) => scope === activeScope)
      ? activeScope
      : null

  useEffect(() => {
    if (groups.length === 0) return
    const anchor = anchorRef.current
    if (!anchor) return

    const scrollRoot =
      anchor.closest<HTMLElement>('.overflow-y-auto') ?? null

    const targets = groups
      .map(([scope]) =>
        document.getElementById(`${SCOPE_ID_PREFIX}${scope}`),
      )
      .filter((el): el is HTMLElement => el !== null)

    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Track the most recent intersection state per target.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
        if (visible.length === 0) return
        // Pick the topmost visible section (smallest top relative to root).
        const top = visible.reduce((best, el) => {
          const a = el.getBoundingClientRect().top
          const b = best.getBoundingClientRect().top
          return a < b ? el : best
        }, visible[0])
        const scope = top.getAttribute(SCOPE_DATA_ATTR) as ShortcutScope | null
        if (scope) setActiveScope(scope)
      },
      {
        root: scrollRoot,
        // Trigger highlight as a section approaches the top third of the viewport.
        rootMargin: '0px 0px -60% 0px',
        threshold: 0,
      },
    )

    for (const t of targets) observer.observe(t)
    return () => observer.disconnect()
  }, [groups])

  const handleClick = useCallback((scope: ShortcutScope) => {
    const el = document.getElementById(`${SCOPE_ID_PREFIX}${scope}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveScope(scope)
  }, [])

  const handleConflictsClick = useCallback(() => {
    const el = document.getElementById(CONFLICTS_ANCHOR_ID)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (groups.length === 0) {
    // Keep a tiny anchor div so a future render can re-attach the observer.
    return <div ref={anchorRef} />
  }

  return (
    <div ref={anchorRef}>
      <p className="px-2 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 select-none">
        On this page
      </p>
      <nav className="flex flex-col gap-0.5">
        {showConflictsLink && (
          <button
            type="button"
            onClick={handleConflictsClick}
            className={cn(navButtonBase, navButtonInactive, 'justify-between text-destructive hover:text-destructive')}
          >
            <span className="truncate">Conflicts</span>
          </button>
        )}
        {groups.map(([scope, scopeShortcuts]) => {
          const isActive = scope === effectiveActive
          return (
            <button
              key={scope}
              type="button"
              onClick={() => handleClick(scope)}
              className={cn(
                navButtonBase,
                isActive ? navButtonActive : navButtonInactive,
                'justify-between',
              )}
            >
              <span className="truncate">{scopeLabels[scope] ?? scope}</span>
              <span
                className={cn(
                  'shrink-0 text-[10px] font-medium tabular-nums',
                  isActive ? 'text-muted-foreground' : 'text-muted-foreground/60',
                )}
              >
                {scopeShortcuts.length}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export { SCOPE_ID_PREFIX, SCOPE_DATA_ATTR, CONFLICTS_ANCHOR_ID }
