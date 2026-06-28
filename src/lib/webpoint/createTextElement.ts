import type { TextElement } from '@/store/webpoint-store/types'

/** Create a new text element centered in the upper-middle of the canvas. */
export function createTextElement(): TextElement {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    x: 20,
    y: 40,
    w: 60,
    h: 16,
    zIndex: 1,
    content: 'New text',
    style: {
      color: '#f8fafc',
      fontSize: 40,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 600,
      fontStyle: 'normal',
      textAlign: 'center',
      lineHeight: 1.2,
      letterSpacing: 0,
    },
    animation: { type: 'none', duration: 500, delay: 0 },
  }
}
