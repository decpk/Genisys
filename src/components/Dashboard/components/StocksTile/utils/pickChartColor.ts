/**
 * Picks the chart line/gradient color for a stock based on its current
 * direction (up = emerald, down = rose, flat = sky).
 */
export interface StockChartColor {
  /** Tailwind text color class (e.g. for chart axis labels). */
  textClass: string
  /** Stroke color (CSS). */
  stroke: string
  /** Gradient start (CSS rgba). */
  gradientStart: string
  /** Gradient end (CSS rgba). */
  gradientEnd: string
}

export function pickChartColor(changePct: number | null | undefined): StockChartColor {
  if (changePct === null || changePct === undefined || Number.isNaN(changePct) || changePct === 0) {
    return {
      textClass: 'text-sky-500',
      stroke: 'rgb(14, 165, 233)',
      gradientStart: 'rgba(14, 165, 233, 0.35)',
      gradientEnd: 'rgba(14, 165, 233, 0)',
    }
  }
  if (changePct > 0) {
    return {
      textClass: 'text-emerald-500',
      stroke: 'rgb(16, 185, 129)',
      gradientStart: 'rgba(16, 185, 129, 0.35)',
      gradientEnd: 'rgba(16, 185, 129, 0)',
    }
  }
  return {
    textClass: 'text-rose-500',
    stroke: 'rgb(244, 63, 94)',
    gradientStart: 'rgba(244, 63, 94, 0.35)',
    gradientEnd: 'rgba(244, 63, 94, 0)',
  }
}
