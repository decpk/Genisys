import type { FaceOptionMeta } from './FullscreenClockFaceSetting.types'

export const FACE_OPTIONS: ReadonlyArray<FaceOptionMeta> = [
  { value: 'minimal', label: 'Minimal', description: 'Clean, oversized digits' },
  { value: 'neon', label: 'Neon', description: 'Glowing digits, dark aesthetic' },
  { value: 'flip', label: 'Flip', description: 'Retro split-flap cards' },
  { value: 'analog', label: 'Analog', description: 'Classic clock with hands' },
  { value: 'aurora', label: 'Aurora', description: 'Living rainbow gradient' },
  { value: 'wireframe', label: 'Wireframe', description: 'Outlined, hairline elegance' },
  { value: 'rings', label: 'Rings', description: 'Orbital arcs around the time' },
]
