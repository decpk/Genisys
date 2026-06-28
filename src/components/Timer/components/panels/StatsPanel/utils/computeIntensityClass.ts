interface Bucket {
  threshold: number
  className: string
}

const BUCKETS: Bucket[] = [
  { threshold: 0, className: 'bg-accent/20' },
  { threshold: 0.25, className: 'bg-primary/30' },
  { threshold: 0.5, className: 'bg-primary/55' },
  { threshold: 0.75, className: 'bg-primary/80' },
  { threshold: 1, className: 'bg-primary' },
]

export function computeIntensityClass(minutes: number, max: number): string {
  if (max <= 0 || minutes <= 0) return BUCKETS[0].className
  const ratio = minutes / max
  let chosen = BUCKETS[0].className
  for (const b of BUCKETS) {
    if (ratio >= b.threshold) chosen = b.className
  }
  return chosen
}
