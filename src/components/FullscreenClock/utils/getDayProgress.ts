export interface DayProgress {
  /** Fraction of the day elapsed in the range [0, 1]. */
  ratio: number
  /** Percent of the day elapsed in the range [0, 100], rounded to nearest integer. */
  percent: number
}

/** Returns how much of the local day has elapsed at the supplied date. */
export function getDayProgress(date: Date): DayProgress {
  const MINUTES_IN_DAY = 24 * 60
  const minutes =
    date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
  const ratio = Math.max(0, Math.min(1, minutes / MINUTES_IN_DAY))
  const percent = Math.round(ratio * 100)
  return { ratio, percent }
}
