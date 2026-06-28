import type { AIPlanStep } from '../AIPlanProgress.types'

/**
 * Result of running `extractImpliedPlanSteps` against assistant prose.
 *
 * `steps` is empty when no recognisable sequence was found, in which case
 * `cleanedContent` is identical to the input.
 */
export interface ImpliedPlanResult {
  steps: AIPlanStep[]
  cleanedContent: string
}

/**
 * Marker kinds that look like agentic task labels in assistant prose.
 *
 * Matched case-insensitively. New kinds should be added here only when they
 * unambiguously signal a sequence of discrete steps (avoid generic words like
 * "Note" or "Section" that show up in normal explanatory prose).
 */
const KIND_PATTERN = '(?:Commit|Step|Task|Phase|Part|Item|Stage)'

/**
 * Matches a single step-like marker, e.g.
 *   `**Commit 1/9**:`
 *   `Step 1 -`
 *   `Task 3 —`
 *
 * Captures:
 *   1: optional opening `**` (with surrounding space)
 *   2: kind word ("Commit", "Step", …)
 *   3: the step number
 *   4: optional total after `/`
 *   5: optional closing `**` (with surrounding space) before the separator
 */
const MARKER_RE = new RegExp(
  '(\\*\\*\\s*)?\\b(' +
    KIND_PATTERN +
    ')\\s+(\\d+)(?:\\s*/\\s*(\\d+))?\\b\\s*(\\*\\*\\s*)?\\s*[:\\-–—]\\s*',
  'gi',
)

/**
 * Minimum number of consecutive, numerically-sequential markers required
 * before we treat the prose as an implicit plan. Three is high enough to
 * avoid lifting an incidental "Step 1: …" mention, but low enough to catch
 * short multi-commit summaries.
 */
const MIN_IMPLICIT_STEPS = 3

interface RawMarker {
  /** Index of the first character of the marker (incl. opening `**`). */
  start: number
  /** Index just past the marker's trailing separator. */
  end: number
  kind: string
  n: number
  total?: number
}

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

/**
 * Scans assistant prose for a sequence of task-like markers (e.g. a wall of
 * `**Commit X/Y**: …` items emitted on a single line) and lifts them into
 * `AIPlanStep`s so the host can render them in the existing `AIPlanProgress`
 * Todos card. The matched ranges are also removed from `cleanedContent` so
 * the markdown renderer does not show the same list as inline prose.
 *
 * Returns `{ steps: [], cleanedContent: content }` when:
 *   - fewer than `MIN_IMPLICIT_STEPS` markers are found
 *   - markers mix kinds (e.g. "Commit 1" then "Step 2")
 *   - marker numbers are not strictly increasing by 1
 *   - any captured title is empty after cleanup
 *
 * The detector is intentionally conservative — when in doubt it leaves the
 * content untouched so legitimate ordered lists/headings are not eaten.
 */
export function extractImpliedPlanSteps(content: string): ImpliedPlanResult {
  if (!content) return { steps: [], cleanedContent: content }

  const markers: RawMarker[] = []
  // Use exec loop instead of matchAll so we always get a fresh lastIndex.
  MARKER_RE.lastIndex = 0
  let match: RegExpExecArray | null = MARKER_RE.exec(content)
  while (match !== null) {
    markers.push({
      start: match.index,
      end: match.index + match[0].length,
      kind: match[2],
      n: Number(match[3]),
      total: match[4] ? Number(match[4]) : undefined,
    })
    match = MARKER_RE.exec(content)
  }

  if (markers.length < MIN_IMPLICIT_STEPS) {
    return { steps: [], cleanedContent: content }
  }

  // All markers must share the same kind (lowercased) so a sequence of mixed
  // labels like "Commit 1 … Step 2 …" does not get lifted.
  const kind = markers[0].kind.toLowerCase()
  const allSameKind = markers.every((m) => m.kind.toLowerCase() === kind)
  if (!allSameKind) return { steps: [], cleanedContent: content }

  // Numbers must increase by exactly 1 between consecutive markers. We allow
  // the sequence to start at any number so status updates like "Commit 4 …
  // Commit 5 … Commit 6 …" still lift cleanly.
  for (let i = 1; i < markers.length; i++) {
    if (markers[i].n !== markers[i - 1].n + 1) {
      return { steps: [], cleanedContent: content }
    }
  }

  const steps: AIPlanStep[] = []
  const cuts: Array<{ start: number; end: number }> = []

  for (let i = 0; i < markers.length; i++) {
    const cur = markers[i]
    const next = markers[i + 1]
    const titleRegionEnd = next ? next.start : content.length

    // Trim the title at the first blank line so prose that follows the last
    // step (e.g. a concluding paragraph) is preserved in `cleanedContent`.
    const region = content.slice(cur.end, titleRegionEnd)
    const blankIdx = region.search(/\n\s*\n/)
    let titleRaw: string
    let cutEnd: number
    if (blankIdx >= 0) {
      titleRaw = region.slice(0, blankIdx)
      cutEnd = cur.end + blankIdx
    } else {
      titleRaw = region
      cutEnd = titleRegionEnd
    }

    // Drop stray bold markers, collapse whitespace, trim trailing separators.
    const title = titleRaw
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[\s:\-–—]+/, '')
      .replace(/[\s:\-–—]+$/, '')
      .trim()

    if (!title) return { steps: [], cleanedContent: content }

    const totalSuffix = cur.total ? ` (${cur.n}/${cur.total})` : ''
    steps.push({
      id: `implicit-${cur.kind.toLowerCase()}-${cur.n}`,
      title: `${capitalize(cur.kind)} ${cur.n}${totalSuffix}: ${title}`,
      status: 'pending',
    })

    cuts.push({ start: cur.start, end: cutEnd })
  }

  // Apply cuts back-to-front so earlier indices stay valid.
  let cleaned = content
  for (let i = cuts.length - 1; i >= 0; i--) {
    cleaned = cleaned.slice(0, cuts[i].start) + cleaned.slice(cuts[i].end)
  }
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()

  return { steps, cleanedContent: cleaned }
}
