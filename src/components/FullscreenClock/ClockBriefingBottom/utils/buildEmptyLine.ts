import type { GetAgendaPillsResult } from '../../utils/getAgendaPills'

/** Builds the fallback line shown when there are no upcoming pills. */
export function buildEmptyLine(
  agenda: GetAgendaPillsResult,
  totalDone: number,
): string {
  if (agenda.isWrapped) {
    const word = totalDone === 1 ? 'item' : 'items'
    return `Wrapped for the day — ${totalDone} ${word} done.`
  }
  if (agenda.isEmpty) {
    return 'An open canvas — nothing on the books for today.'
  }
  return ''
}
