import type { PromptPosition } from '../components/AIInlinePrompt.types'

const PROMPT_WIDTH = 400
const PROMPT_HEIGHT = 120
const PADDING = 8

export function computePromptPosition(
  coords: { top: number; left: number; bottom: number },
): PromptPosition {
  // Prefer below cursor
  let top = coords.bottom + PADDING
  if (top + PROMPT_HEIGHT > window.innerHeight) {
    // Flip above if not enough space below
    top = coords.top - PADDING - PROMPT_HEIGHT
  }

  let left = coords.left
  // Clamp to viewport
  if (left + PROMPT_WIDTH > window.innerWidth) {
    left = window.innerWidth - PROMPT_WIDTH - PADDING
  }
  if (left < PADDING) left = PADDING

  return { top, left }
}
