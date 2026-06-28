import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/store/settings-store'

import { useTerminalAutocompleteOverlayData } from './useTerminalAutocompleteOverlayData'

interface TerminalAutocompleteOverlayProps {
  sessionId: string
  visible: boolean
}

/**
 * Renders history autocomplete over a terminal surface: a dim inline ghost-text
 * suffix at the caret plus an optional ranked dropdown of past commands. Purely
 * presentational — suggestion state, positioning, and accept/inject live in
 * `useTerminalAutocompleteOverlayData` + the autocomplete engine.
 *
 * The root stays mounted (even with nothing to show) so its ref is available for
 * cursor-position measurement. It's `pointer-events-none` so terminal mouse
 * interactions pass through; only the dropdown re-enables pointer events.
 */
export function TerminalAutocompleteOverlay({
  sessionId,
  visible,
}: TerminalAutocompleteOverlayProps) {
  const { overlayRef, suggestion, pos, ghostStyle, ghostHidden, menuBelow, onAcceptMatch, onHoverMatch } =
    useTerminalAutocompleteOverlayData(sessionId, visible)
  const enabled = useSettingsStore((s) => s.terminalHistoryAutocomplete)

  const showGhost =
    enabled && visible && !menuBelow && !ghostHidden && !!pos && suggestion.ghost.length > 0
  const showDropdown =
    enabled && visible && !menuBelow && !!pos && suggestion.open && suggestion.items.length > 0

  return (
    <div ref={overlayRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {showGhost && pos && (
        <span
          className="absolute select-none whitespace-pre opacity-40"
          style={{ left: pos.left, top: pos.top, ...ghostStyle }}
        >
          {suggestion.ghost}
        </span>
      )}
      {showDropdown && pos && (
        <ul
          role="listbox"
          className="pointer-events-auto absolute z-10 max-w-[480px] min-w-[200px] overflow-hidden rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-md"
          style={{
            left: pos.left,
            top: pos.dropUp ? pos.top : pos.top + pos.cellH,
            transform: pos.dropUp ? 'translateY(-100%)' : undefined,
          }}
        >
          {suggestion.items.map((item, i) => (
            <li
              key={item.value}
              role="option"
              aria-selected={i === suggestion.index}
              className={cn(
                'flex cursor-pointer items-center gap-2 truncate px-3 py-1 font-mono text-xs',
                i === suggestion.index
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground',
              )}
              onMouseEnter={() => onHoverMatch(i)}
              onMouseDown={(e) => {
                // Keep terminal focus (don't blur the hidden xterm textarea).
                e.preventDefault()
                onAcceptMatch(i)
              }}
            >
              <span className="truncate">{item.label}</span>
              {item.kind === 'path' && (
                <span className="ml-auto shrink-0 text-[10px] opacity-50">
                  {item.isDir ? 'dir' : 'file'}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
