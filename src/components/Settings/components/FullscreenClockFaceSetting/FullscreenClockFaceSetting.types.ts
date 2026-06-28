import type { FullscreenClockFace } from '@/store/settings-store'

export interface FaceOptionMeta {
  value: FullscreenClockFace
  label: string
  description: string
}

export interface FaceOptionProps {
  meta: FaceOptionMeta
  isActive: boolean
  onSelect: (face: FullscreenClockFace) => void
}

export interface FacePreviewProps {
  face: FullscreenClockFace
}
