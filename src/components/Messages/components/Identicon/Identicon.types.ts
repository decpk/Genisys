export interface IdenticonProps {
  seed: string
  size?: number
  rounded?: boolean
  className?: string
}

export interface IdenticonGradient {
  from: string
  to: string
}

export interface IdenticonData {
  gradient: IdenticonGradient
  cells: boolean[][]
  gradientId: string
}
