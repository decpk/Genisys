import { useWebpointStore } from '@/store/webpoint-store'

import { normalizeSlideInput } from './normalizeSlideInput'
import type { ParsedWebpointResponse } from './types'

/**
 * Apply a parsed AI response to the active presentation. Returns the number of
 * slides changed.
 */
export async function applyWebpointResponse(
  presentationId: string,
  parsed: ParsedWebpointResponse
): Promise<number> {
  const store = useWebpointStore.getState()

  if (parsed.action === 'update_slide' && parsed.slide) {
    const input = normalizeSlideInput(parsed.slide)
    const activeSlideId = store.activeSlideId
    if (!activeSlideId) return 0
    await store.updateSlideData(activeSlideId, input.data)
    return 1
  }

  const slides = Array.isArray(parsed.slides) ? parsed.slides : []
  const inputs = slides.map(normalizeSlideInput)
  if (inputs.length === 0) return 0

  if (parsed.action === 'add_slides') {
    await store.appendSlides(presentationId, inputs)
    return inputs.length
  }

  await store.replaceSlides(presentationId, inputs, parsed.title)
  return inputs.length
}
