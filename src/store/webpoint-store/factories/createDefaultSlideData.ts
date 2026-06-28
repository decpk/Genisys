import type { SlideData } from '@/store/webpoint-store/types'

/**
 * A sensible starting point for a new slide: a subtle gradient background and a
 * centered title text element the user (or the AI) can immediately edit.
 */
export function createDefaultSlideData(title = 'New Slide'): SlideData {
  return {
    background: {
      type: 'gradient',
      gradient: {
        kind: 'linear',
        angle: 135,
        stops: [
          { color: '#1e293b', position: 0 },
          { color: '#0f172a', position: 100 },
        ],
      },
    },
    transition: 'fade',
    elements: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        x: 12,
        y: 38,
        w: 76,
        h: 24,
        zIndex: 1,
        content: title,
        style: {
          color: '#f8fafc',
          fontSize: 64,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          fontStyle: 'normal',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: 0,
        },
        animation: { type: 'fade', duration: 500, delay: 0 },
      },
    ],
  }
}
