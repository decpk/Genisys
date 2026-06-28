export interface SlideFramesProps {
  docA: string | null
  docB: string | null
  front: 'a' | 'b'
  fadeMs: number
  onLoadA: () => void
  onLoadB: () => void
}
