import type { SlideBackground } from '@/store/webpoint-store/types'

/** Solid background swatches offered in the inspector. */
export const SOLID_PRESETS: readonly string[] = [
  '#0f172a',
  '#1e293b',
  '#111827',
  '#0c4a6e',
  '#312e81',
  '#3f0d2e',
  '#064e3b',
  '#7c2d12',
  '#ffffff',
  '#f8fafc',
]

/** Gradient background presets offered in the inspector. */
export const GRADIENT_PRESETS: readonly SlideBackground[] = [
  {
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
  {
    type: 'gradient',
    gradient: {
      kind: 'linear',
      angle: 135,
      stops: [
        { color: '#4f46e5', position: 0 },
        { color: '#9333ea', position: 100 },
      ],
    },
  },
  {
    type: 'gradient',
    gradient: {
      kind: 'linear',
      angle: 135,
      stops: [
        { color: '#0ea5e9', position: 0 },
        { color: '#2dd4bf', position: 100 },
      ],
    },
  },
  {
    type: 'gradient',
    gradient: {
      kind: 'linear',
      angle: 135,
      stops: [
        { color: '#f97316', position: 0 },
        { color: '#db2777', position: 100 },
      ],
    },
  },
  {
    type: 'gradient',
    gradient: {
      kind: 'linear',
      angle: 160,
      stops: [
        { color: '#020617', position: 0 },
        { color: '#1e3a8a', position: 100 },
      ],
    },
  },
  {
    type: 'gradient',
    gradient: {
      kind: 'radial',
      angle: 0,
      stops: [
        { color: '#334155', position: 0 },
        { color: '#0f172a', position: 100 },
      ],
    },
  },
]
