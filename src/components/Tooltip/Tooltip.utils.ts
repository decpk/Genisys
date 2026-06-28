import type { TooltipSide } from './Tooltip.types'

const OFFSET = 10
const VIEWPORT_PADDING = 6

interface Position {
  top: number
  left: number
}

export interface ComputedPosition extends Position {
  resolvedSide: TooltipSide
  arrowOffset: number
}

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
}

function rawPosition(trigger: DOMRect, side: TooltipSide, ttW: number, ttH: number, offset: number): Position {
  switch (side) {
    case 'bottom':
      return { top: trigger.bottom + offset, left: trigger.left + trigger.width / 2 - ttW / 2 }
    case 'left':
      return { top: trigger.top + trigger.height / 2 - ttH / 2, left: trigger.left - ttW - offset }
    case 'right':
      return { top: trigger.top + trigger.height / 2 - ttH / 2, left: trigger.right + offset }
    default:
      return { top: trigger.top - ttH - offset, left: trigger.left + trigger.width / 2 - ttW / 2 }
  }
}

// Whether the candidate position has room along the side's MAIN axis only
// (vertical room for top/bottom, horizontal room for left/right). The cross
// axis is handled separately by clamping, so a tooltip that merely overflows
// the cross axis (e.g. a top/bottom tooltip near the right edge of the screen)
// no longer needlessly defeats the preferred side — it just shifts to fit.
function fitsAlongMainAxis(pos: Position, ttW: number, ttH: number, side: TooltipSide): boolean {
  const vw = window.innerWidth
  const vh = window.innerHeight
  switch (side) {
    case 'top':
      return pos.top >= VIEWPORT_PADDING
    case 'bottom':
      return pos.top + ttH <= vh - VIEWPORT_PADDING
    case 'left':
      return pos.left >= VIEWPORT_PADDING
    case 'right':
      return pos.left + ttW <= vw - VIEWPORT_PADDING
  }
}

function clamp(pos: Position, ttW: number, ttH: number): Position {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return {
    top: Math.max(VIEWPORT_PADDING, Math.min(pos.top, vh - ttH - VIEWPORT_PADDING)),
    left: Math.max(VIEWPORT_PADDING, Math.min(pos.left, vw - ttW - VIEWPORT_PADDING))
  }
}

function computeArrowOffset(
  trigger: DOMRect,
  pos: Position,
  ttW: number,
  ttH: number,
  side: TooltipSide
): number {
  if (side === 'top' || side === 'bottom') {
    const triggerCenterX = trigger.left + trigger.width / 2
    const tooltipCenterX = pos.left + ttW / 2
    return triggerCenterX - tooltipCenterX
  }
  const triggerCenterY = trigger.top + trigger.height / 2
  const tooltipCenterY = pos.top + ttH / 2
  return triggerCenterY - tooltipCenterY
}

export function computePosition(
  trigger: DOMRect,
  ttW: number,
  ttH: number,
  preferred: TooltipSide,
  sideOffset: number = OFFSET
): ComputedPosition {
  // Choose the side by checking room along the MAIN axis only: flip top<->bottom
  // (or left<->right) only when the preferred side genuinely lacks room in that
  // direction. Overflow on the cross axis is resolved by clamping below, so a
  // top/bottom tooltip near a screen edge keeps its vertical side and just
  // shifts horizontally instead of getting pinned into the corner.
  let side = preferred
  const preferredPos = rawPosition(trigger, preferred, ttW, ttH, sideOffset)
  if (!fitsAlongMainAxis(preferredPos, ttW, ttH, preferred)) {
    const opp = OPPOSITE[preferred]
    const flipped = rawPosition(trigger, opp, ttW, ttH, sideOffset)
    if (fitsAlongMainAxis(flipped, ttW, ttH, opp)) {
      side = opp
    }
  }

  // Clamp to the viewport so the tooltip is always fully visible, then point the
  // arrow at the trigger from the (possibly shifted) tooltip box.
  const raw = side === preferred ? preferredPos : rawPosition(trigger, side, ttW, ttH, sideOffset)
  const clamped = clamp(raw, ttW, ttH)
  return { ...clamped, resolvedSide: side, arrowOffset: computeArrowOffset(trigger, clamped, ttW, ttH, side) }
}
