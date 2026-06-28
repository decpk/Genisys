import type { Slide } from '@/store/webpoint-store/types'

import { createDefaultSlideData } from './createDefaultSlideData'

/** Build a fresh `Slide` row for a presentation at the given order index. */
export function createBlankSlide(presentationId: string, sortOrder: number): Slide {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    presentationId,
    sortOrder,
    title: `Slide ${sortOrder + 1}`,
    notes: '',
    data: createDefaultSlideData(),
    createdAt: now,
    updatedAt: now,
  }
}
