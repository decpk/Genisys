import type { ToolActivity } from '../../ToolActivityRenderer.types'
import type { StepProgressSummary } from '../StepProgressList.types'

/** Plural-aware "1 tool" / "N tools" suffix. */
function pluralizeTool(count: number): string {
  if (count === 1) return '1 tool'
  return `${count} tools`
}

/**
 * Header text mirroring VS Code's task progress phrasing.
 *
 * - All done, no errors  -> "N tools used"
 * - All done, some errors -> "N tools \u2014 X failed"
 * - Currently running    -> "Tool (running+1) of N \u2014 <label>"
 * - Nothing running yet  -> "N tools queued"
 */
export function formatStepHeaderText(
  activities: ToolActivity[],
  summary: StepProgressSummary,
): string {
  const { total, doneCount, runningIndex, isAllDone, errorCount } = summary

  if (isAllDone && errorCount === 0) {
    return `${pluralizeTool(total)} used`
  }

  if (isAllDone && errorCount > 0) {
    return `${pluralizeTool(total)} \u2014 ${errorCount} failed`
  }

  if (runningIndex >= 0) {
    const current = activities[runningIndex]
    const label = current.label ?? current.toolName
    return `Tool ${runningIndex + 1} of ${total} \u2014 ${label}`
  }

  if (doneCount > 0 && doneCount < total) {
    return `Tool ${doneCount + 1} of ${total}`
  }

  return `${pluralizeTool(total)} queued`
}
