import { CHART_PALETTE } from '../RechartsViewer.constants'

export function pickPaletteColor(index: number, override?: string): string {
  if (override) {
    return override
  }
  return CHART_PALETTE[index % CHART_PALETTE.length]
}
