import type { PresentationWithSlides, Slide } from '@/store/webpoint-store/types'

import { WEBPOINT_SLIDE_SCHEMA } from './webpointSlideSchema'

function deckContext(presentation: PresentationWithSlides): string {
  const slides = presentation.slides.map((slide, index) => ({
    index,
    id: slide.id,
    title: slide.title,
    data: slide.data,
  }))
  return JSON.stringify(slides)
}

/**
 * Build the full prompt for a WebPoint AI turn. The current deck is always
 * included as context (manual edits may have changed it since the last turn).
 */
export function buildWebpointPrompt(
  presentation: PresentationWithSlides,
  activeSlide: Slide | null,
  userPrompt: string,
  isResume: boolean
): string {
  const intro = isResume
    ? 'Continuing the same WebPoint presentation.'
    : 'You are WebPoint, an assistant that builds and edits HTML/CSS slide decks.'

  return `${intro}

Current deck title: ${JSON.stringify(presentation.presentation.title)}
Current slides (JSON): ${deckContext(presentation)}
The user is viewing slide id: ${JSON.stringify(activeSlide?.id ?? null)}

${WEBPOINT_SLIDE_SCHEMA}

User request: ${userPrompt}`
}
