import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import type { PluggableList } from 'unified'

/** Remark pipeline: GFM + math, plus any consumer-supplied plugins. */
export function createRemarkPlugins(extra: PluggableList = []): PluggableList {
  return [remarkGfm, remarkMath, ...extra]
}
