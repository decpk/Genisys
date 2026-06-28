import { createDefaultSlideData } from '@/store/webpoint-store/factories/createDefaultSlideData'
import type {
  ElementAnimation,
  ElementAnimationType,
  ShapeElement,
  SlideBackground,
  SlideData,
  SlideElement,
  SlideInput,
  SlideTransition,
  TextAlign,
  TextElement,
} from '@/store/webpoint-store/types'

import type { RawSlide } from './types'

const ANIMATION_TYPES: ElementAnimationType[] = [
  'none',
  'fade',
  'slide-up',
  'slide-down',
  'slide-left',
  'slide-right',
  'zoom',
  'bounce',
]
const TRANSITIONS: SlideTransition[] = ['none', 'fade', 'slide', 'zoom', 'flip']
const ALIGNS: TextAlign[] = ['left', 'center', 'right']

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}
function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}
function clampPct(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function normalizeAnimation(raw: unknown): ElementAnimation {
  const o = (raw ?? {}) as Record<string, unknown>
  const type = ANIMATION_TYPES.includes(o.type as ElementAnimationType)
    ? (o.type as ElementAnimationType)
    : 'none'
  return { type, duration: num(o.duration, 500), delay: num(o.delay, 0) }
}

function normalizeBackground(raw: unknown): SlideBackground {
  const o = (raw ?? {}) as Record<string, unknown>
  if (o.type === 'solid' && typeof o.color === 'string') {
    return { type: 'solid', color: o.color }
  }
  if (o.type === 'gradient' && o.gradient && typeof o.gradient === 'object') {
    const g = o.gradient as Record<string, unknown>
    const stopsRaw = Array.isArray(g.stops) ? g.stops : []
    const stops = stopsRaw.map((stop) => {
      const so = (stop ?? {}) as Record<string, unknown>
      return { color: str(so.color, '#000000'), position: clampPct(num(so.position, 0)) }
    })
    if (stops.length >= 2) {
      const kind = g.kind === 'radial' ? 'radial' : 'linear'
      return { type: 'gradient', gradient: { kind, angle: num(g.angle, 135), stops } }
    }
  }
  return createDefaultSlideData().background
}

function normalizeElement(raw: unknown): SlideElement | null {
  const o = (raw ?? {}) as Record<string, unknown>
  const base = {
    id: crypto.randomUUID(),
    x: clampPct(num(o.x, 10)),
    y: clampPct(num(o.y, 10)),
    w: clampPct(num(o.w, 40)),
    h: clampPct(num(o.h, 15)),
    zIndex: typeof o.zIndex === 'number' ? o.zIndex : 1,
    animation: normalizeAnimation(o.animation),
  }

  if (o.type === 'shape') {
    const s = (o.style ?? {}) as Record<string, unknown>
    const shape: ShapeElement = {
      ...base,
      type: 'shape',
      shape: o.shape === 'ellipse' ? 'ellipse' : 'rectangle',
      style: { fill: str(s.fill, '#6366f1'), borderRadius: num(s.borderRadius, 0), opacity: num(s.opacity, 1) },
    }
    return shape
  }

  if (o.type === 'image' && typeof o.src === 'string') {
    return { ...base, type: 'image', src: o.src, style: {} }
  }

  const s = (o.style ?? {}) as Record<string, unknown>
  const textAlign = ALIGNS.includes(s.textAlign as TextAlign) ? (s.textAlign as TextAlign) : 'left'
  const text: TextElement = {
    ...base,
    type: 'text',
    content: str(o.content, ''),
    style: {
      color: str(s.color, '#f8fafc'),
      fontSize: num(s.fontSize, 32),
      fontFamily: str(s.fontFamily, 'Inter, system-ui, sans-serif'),
      fontWeight: num(s.fontWeight, 400),
      fontStyle: s.fontStyle === 'italic' ? 'italic' : 'normal',
      textAlign,
      lineHeight: num(s.lineHeight, 1.2),
      letterSpacing: num(s.letterSpacing, 0),
    },
  }
  return text
}

/** Coerce a loose AI-provided slide into a valid `SlideInput` (assigns element ids,
 *  fills missing styles, clamps geometry). */
export function normalizeSlideInput(raw: RawSlide): SlideInput {
  const elementsRaw = Array.isArray(raw.elements) ? raw.elements : []
  const elements = elementsRaw
    .map(normalizeElement)
    .filter((el): el is SlideElement => el !== null)
  const transition = TRANSITIONS.includes(raw.transition as SlideTransition)
    ? (raw.transition as SlideTransition)
    : 'fade'

  const data: SlideData = {
    background: normalizeBackground(raw.background),
    elements,
    transition,
  }

  return {
    title: typeof raw.title === 'string' ? raw.title : undefined,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    data,
  }
}
