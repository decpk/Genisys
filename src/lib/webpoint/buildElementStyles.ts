import type { SlideElement, TextAlign } from '@/store/webpoint-store/types'

import { scaleFont } from './scaleFont'

const TEXT_ALIGN_TO_ITEMS: Record<TextAlign, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}

/**
 * Compute the inline style map for a slide element. Position/size are expressed
 * as percentages of the slide canvas; font size scales with `fontUnit`.
 * Returns a camelCase map usable directly as a React `style` or serialized for
 * the compiled slide HTML. Animations are included only when `animate` is true
 * (the stage uses them; static thumbnails do not).
 */
export function buildElementStyles(
  element: SlideElement,
  fontUnit: 'vw' | 'cqw' | 'px',
  animate = true
): Record<string, string> {
  const style: Record<string, string> = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.w}%`,
    height: `${element.h}%`,
    overflow: 'hidden',
  }

  if (element.rotation) style.transform = `rotate(${element.rotation}deg)`
  if (element.zIndex != null) style.zIndex = String(element.zIndex)

  if (animate && element.animation && element.animation.type !== 'none') {
    style.animationName = element.animation.type
    style.animationDuration = `${element.animation.duration}ms`
    style.animationDelay = `${element.animation.delay}ms`
    style.animationTimingFunction = 'ease'
    style.animationFillMode = 'both'
  }

  if (element.type === 'text') {
    const text = element.style
    style.display = 'flex'
    style.flexDirection = 'column'
    style.justifyContent = 'center'
    style.alignItems = TEXT_ALIGN_TO_ITEMS[text.textAlign]
    style.color = text.color
    style.fontSize = scaleFont(text.fontSize, fontUnit)
    style.fontFamily = text.fontFamily
    style.fontWeight = String(text.fontWeight)
    style.fontStyle = text.fontStyle
    style.textAlign = text.textAlign
    style.lineHeight = String(text.lineHeight)
    style.letterSpacing = scaleFont(text.letterSpacing, fontUnit)
    style.whiteSpace = 'pre-wrap'
    style.wordBreak = 'break-word'
    if (text.backgroundColor) style.backgroundColor = text.backgroundColor
    return style
  }

  if (element.type === 'shape') {
    const shape = element.style
    style.backgroundColor = shape.fill
    if (shape.opacity != null) style.opacity = String(shape.opacity)
    if (shape.stroke && shape.strokeWidth) {
      style.border = `${shape.strokeWidth}px solid ${shape.stroke}`
    }
    if (element.shape === 'ellipse') style.borderRadius = '50%'
    else if (shape.borderRadius != null) style.borderRadius = `${shape.borderRadius}px`
    return style
  }

  // image
  if (element.style.opacity != null) style.opacity = String(element.style.opacity)
  if (element.style.borderRadius != null) {
    style.borderRadius = `${element.style.borderRadius}px`
  }
  return style
}
