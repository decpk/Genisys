import { useRef, useState, useEffect, useCallback } from 'react'
import * as ReactDOM from 'react-dom'
import { Kbd } from '@/components/ui/kbd'
import { computePosition } from './Tooltip.utils'
import type { TooltipProps, TooltipSide } from './Tooltip.types'

const ARROW_SIZE = 8
const ARROW_HALF = ARROW_SIZE / 2
const ARROW_EDGE_PAD = 8

function getArrowStyle(side: TooltipSide, arrowOffset: number, ttW: number, ttH: number): React.CSSProperties {
  const isHorizontal = side === 'top' || side === 'bottom'
  const extent = isHorizontal ? ttW : ttH
  const offset = Math.max(ARROW_EDGE_PAD, Math.min(extent / 2 + arrowOffset - ARROW_HALF, extent - ARROW_EDGE_PAD - ARROW_SIZE))

  switch (side) {
    case 'top':
      return { bottom: -ARROW_HALF, left: offset }
    case 'bottom':
      return { top: -ARROW_HALF, left: offset }
    case 'left':
      return { right: -ARROW_HALF, top: offset }
    case 'right':
      return { left: -ARROW_HALF, top: offset }
  }
}

function Tooltip({ content, children, side = 'top', sideOffset, shortcut, delayMs = 200, className, triggerClassName, interactive = false, variant = 'default', disabled = false, expandedContent, expandDelayMs = 5000 }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [layout, setLayout] = useState({ top: 0, left: 0, resolvedSide: side as TooltipSide, arrowOffset: 0, ttW: 0, ttH: 0 })
  const [ready, setReady] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const show = useCallback(() => {
    if (disabled) return
    cancelHideTimer()
    timerRef.current = setTimeout(() => setVisible(true), delayMs)
    // Stage 2: after the cursor rests on the trigger for `expandDelayMs`, swap
    // the simple tooltip for the richer `expandedContent` card. Re-arm on each
    // enter so the timer always measures from the latest hover.
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current)
      expandTimerRef.current = null
    }
    if (expandedContent != null) {
      expandTimerRef.current = setTimeout(() => {
        setExpanded(true)
        // Re-fade while the larger card is measured + repositioned.
        setReady(false)
      }, expandDelayMs)
    }
  }, [disabled, delayMs, cancelHideTimer, expandedContent, expandDelayMs])

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current)
      expandTimerRef.current = null
    }
    const isInteractive = interactive || (expanded && expandedContent != null)
    if (isInteractive) {
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
        setReady(false)
        setExpanded(false)
      }, 150)
    } else {
      setVisible(false)
      setReady(false)
      setExpanded(false)
    }
  }, [interactive, expanded, expandedContent])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
    }
  }, [])

  // When the tooltip becomes disabled (e.g. its trigger's menu opened), cancel
  // any pending show timer so it can't pop after the menu opens. Actual
  // hiding is handled at render time via the `disabled` gate below.
  useEffect(() => {
    if (!disabled) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current)
      expandTimerRef.current = null
    }
    cancelHideTimer()
  }, [disabled, cancelHideTimer])

  useEffect(() => {
    if (!visible || !triggerRef.current) return

    requestAnimationFrame(() => {
      if (!triggerRef.current || !tooltipRef.current) return
      const trigger = triggerRef.current.getBoundingClientRect()
      const tt = tooltipRef.current.getBoundingClientRect()
      const computed = computePosition(trigger, tt.width, tt.height, side, sideOffset)
      setLayout({ top: computed.top, left: computed.left, resolvedSide: computed.resolvedSide, arrowOffset: computed.arrowOffset, ttW: tt.width, ttH: tt.height })
      setReady(true)
    })
  }, [visible, side, expanded])

  // Stage selector: once the expand delay has elapsed and richer content was
  // supplied, render it as an interactive popover card instead of the simple
  // tooltip. `interactive` is forced on while expanded so the pointer can move
  // into the card without it dismissing.
  const isExpanded = expanded && expandedContent != null
  const effectiveInteractive = interactive || isExpanded
  const effectiveVariant = isExpanded ? 'popover' : variant
  const renderContent = isExpanded ? expandedContent : content

  // Safety net: if the trigger's parent ever becomes pointer-events:none (e.g.
  // the user switches Genisys apps while a tooltip is showing), the trigger
  // never receives `mouseLeave`, leaving the portal-rendered tooltip stuck on
  // screen. Listen for global pointer movement while visible and force-hide
  // when the pointer is outside both the trigger and (when interactive) the
  // tooltip element.
  useEffect(() => {
    if (!visible) return
    function isInsideRect(el: Element | null, x: number, y: number): boolean {
      if (!el) return false
      const r = el.getBoundingClientRect()
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    }
    function onDocPointerMove(e: PointerEvent) {
      const x = e.clientX
      const y = e.clientY
      const overTrigger = isInsideRect(triggerRef.current, x, y)
      const overTooltip = effectiveInteractive && isInsideRect(tooltipRef.current, x, y)
      if (!overTrigger && !overTooltip) hide()
    }
    document.addEventListener('pointermove', onDocPointerMove, { passive: true })
    return () => document.removeEventListener('pointermove', onDocPointerMove)
  }, [visible, effectiveInteractive, hide])

  const arrowStyle = getArrowStyle(layout.resolvedSide, layout.arrowOffset, layout.ttW, layout.ttH)

  return (
    <span ref={triggerRef} className={triggerClassName ?? 'inline-flex'} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && !disabled && renderContent != null &&
        ReactDOM.createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{ top: layout.top, left: layout.left }}
            className={`${effectiveInteractive ? 'pointer-events-auto' : 'pointer-events-none'} fixed z-[9999] transition-opacity duration-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)] ${ready ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={effectiveInteractive ? cancelHideTimer : undefined}
            onMouseLeave={effectiveInteractive ? hide : undefined}
          >
            <span
              className={`absolute size-2 rotate-45 ${effectiveVariant === 'popover' ? 'bg-popover' : 'bg-foreground dark:bg-foreground'}`}
              style={arrowStyle}
            />
            {isExpanded ? (
              <span
                className={`relative z-10 block overflow-hidden rounded-[10px] border border-border bg-popover text-popover-foreground font-system ${className ?? ''}`}
              >
                {expandedContent}
              </span>
            ) : (
              <span
                className={`relative z-10 whitespace-nowrap rounded-[7px] ${variant === 'popover' ? 'bg-popover text-popover-foreground border border-border' : 'bg-foreground text-background'} px-3 py-1.5 text-xs font-medium font-system flex items-center gap-2 ${className ?? ''}`}
              >
                <span>{content}</span>
                {shortcut && <Kbd shortcut={shortcut} />}
              </span>
            )}
          </div>,
          document.body
        )}
    </span>
  )
}

export { Tooltip }
