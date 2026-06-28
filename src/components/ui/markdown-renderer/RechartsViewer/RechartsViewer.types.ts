export type ChartType = 'bar' | 'line' | 'area' | 'pie'

export interface ChartSeries {
  key: string
  name?: string
  color?: string
}

export interface ChartSpec {
  type: ChartType
  title?: string
  data: Array<Record<string, string | number>>
  xKey?: string
  series?: Array<ChartSeries>
  nameKey?: string
  valueKey?: string
  colors?: string[]
}

export interface RechartsViewerProps {
  spec: string
}

export type ParseChartResult =
  | { ok: true; spec: ChartSpec }
  | { ok: false; error: string }

export interface ChartViewProps {
  spec: ChartSpec
}
