export interface TimeParts {
  hh: string
  mm: string
  ss: string
  ampm: string
}

export interface FaceProps {
  parts: TimeParts
  now: Date
}
