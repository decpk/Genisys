import type { ChartSpec, ParseChartResult } from '../RechartsViewer.types'

const VALID_TYPES: ReadonlyArray<ChartSpec['type']> = ['bar', 'line', 'area', 'pie']

export function parseChartSpec(raw: string): ParseChartResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Invalid JSON: the chart specification could not be parsed.' }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'Chart spec must be a JSON object.' }
  }

  const spec = parsed as Partial<ChartSpec>

  if (typeof spec.type !== 'string' || !VALID_TYPES.includes(spec.type as ChartSpec['type'])) {
    return {
      ok: false,
      error: `Missing or invalid "type". Expected one of: ${VALID_TYPES.join(', ')}.`,
    }
  }

  if (!Array.isArray(spec.data) || spec.data.length === 0) {
    return { ok: false, error: 'Chart "data" must be a non-empty array.' }
  }

  if (spec.type !== 'pie') {
    if (typeof spec.xKey !== 'string' || spec.xKey.length === 0) {
      return { ok: false, error: `Chart type "${spec.type}" requires an "xKey".` }
    }
    if (!Array.isArray(spec.series) || spec.series.length === 0) {
      return { ok: false, error: `Chart type "${spec.type}" requires a non-empty "series" array.` }
    }
  }

  return { ok: true, spec: spec as ChartSpec }
}
