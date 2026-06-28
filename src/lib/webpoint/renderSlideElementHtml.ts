import type { SlideElement } from '@/store/webpoint-store/types'

import { buildElementStyles } from './buildElementStyles'
import { cssObjectToString } from './cssObjectToString'
import { escapeHtml } from './escapeHtml'

/** Render a single slide element to inline HTML. Shared by the sandboxed slide
 *  compiler (`vw` scaling) and the standalone HTML exporter (`px` on a fixed
 *  1280×720 stage). */
export function renderSlideElementHtml(
  element: SlideElement,
  fontUnit: 'vw' | 'cqw' | 'px'
): string {
  const style = cssObjectToString(buildElementStyles(element, fontUnit, true))

  if (element.type === 'text') {
    return `<div style="${style}">${escapeHtml(element.content)}</div>`
  }
  if (element.type === 'image') {
    const fit = element.style.objectFit ?? 'cover'
    return `<div style="${style}"><img src="${escapeHtml(element.src)}" alt="" style="width:100%;height:100%;object-fit:${fit};display:block" /></div>`
  }
  return `<div style="${style}"></div>`
}
