// ─── Quiz & Challenge Parser ────────────────────────────────────
// Extracts quiz and challenge sections from chapter markdown and
// parses them into structured data for interactive rendering.

export interface QuizOption {
  label: string
  isCorrect: boolean
}

export interface QuizQuestion {
  questionMarkdown: string
  options: QuizOption[]
  answer: string
  explanation: string
  isMultiSelect: boolean
}

export type ChallengeTier = 'easy' | 'medium' | 'hard' | 'boss'

export interface ChallengeItem {
  tier: ChallengeTier
  title: string
  /** Markdown body (description + starter code + hint) */
  bodyMarkdown: string
  /** Solution code/markdown inside the <details> block */
  solutionMarkdown: string
}

export interface MarkdownSegment {
  type: 'markdown'
  content: string
}

export interface QuizSegment {
  type: 'quiz'
  title: string
  questions: QuizQuestion[]
}

export interface ChallengeSegment {
  type: 'challenge'
  challenges: ChallengeItem[]
}

export type ContentSegment = MarkdownSegment | QuizSegment | ChallengeSegment

// ── Attribute / tag helpers for the <lib-*> block protocol ──

function getAttr(attrStr: string, name: string): string | undefined {
  const match = attrStr.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'))
  return match ? match[1] : undefined
}

function hasFlag(attrStr: string, name: string): boolean {
  return new RegExp(`\\b${name}(?=[\\s=>]|$)`, 'i').test(attrStr)
}

/** Inner content of the first `<lib-NAME>…</lib-NAME>` in `raw`, trimmed. */
function innerTag(raw: string, name: string): string {
  const match = raw.match(new RegExp(`<lib-${name}\\b[^>]*>([\\s\\S]*?)</lib-${name}>`, 'i'))
  return match ? match[1].trim() : ''
}

const VALID_TIERS: readonly ChallengeTier[] = ['easy', 'medium', 'hard', 'boss']

function toTier(value: string | undefined): ChallengeTier {
  return value && (VALID_TIERS as readonly string[]).includes(value)
    ? (value as ChallengeTier)
    : 'easy'
}

/** Parse a `<lib-quiz>` block into a title + structured questions. */
export function parseLibQuiz(raw: string): { title: string; questions: QuizQuestion[] } {
  const head = raw.match(/<lib-quiz\b([^>]*)>/i)
  const title = (head && getAttr(head[1], 'title')) || 'Quiz'
  const questions: QuizQuestion[] = []

  const questionRe = /<lib-question\b([^>]*)>([\s\S]*?)<\/lib-question>/gi
  let qm: RegExpExecArray | null
  while ((qm = questionRe.exec(raw)) !== null) {
    const [, qAttrs, body] = qm
    const options: QuizOption[] = []
    const optionRe = /<lib-option\b([^>]*)>([\s\S]*?)<\/lib-option>/gi
    let om: RegExpExecArray | null
    while ((om = optionRe.exec(body)) !== null) {
      options.push({ label: om[2].trim(), isCorrect: hasFlag(om[1], 'correct') })
    }
    questions.push({
      questionMarkdown: innerTag(body, 'prompt'),
      options,
      answer: innerTag(body, 'answer'),
      explanation: innerTag(body, 'explanation'),
      isMultiSelect: getAttr(qAttrs, 'type') === 'multi',
    })
  }

  return { title, questions }
}

/** Parse a `<lib-challenge>` block into structured challenge items. */
export function parseLibChallenge(raw: string): ChallengeItem[] {
  const challenges: ChallengeItem[] = []
  const taskRe = /<lib-task\b([^>]*)>([\s\S]*?)<\/lib-task>/gi
  let tm: RegExpExecArray | null
  while ((tm = taskRe.exec(raw)) !== null) {
    const [, attrs, body] = tm
    const brief = innerTag(body, 'brief')
    const starter = innerTag(body, 'starter')
    const hint = innerTag(body, 'hint')
    const bodyParts = [brief]
    if (starter) bodyParts.push(starter)
    if (hint) bodyParts.push(`> **Hint:** ${hint}`)
    challenges.push({
      tier: toTier(getAttr(attrs, 'tier')),
      title: getAttr(attrs, 'title') ?? 'Challenge',
      bodyMarkdown: bodyParts.filter(Boolean).join('\n\n'),
      solutionMarkdown: innerTag(body, 'solution'),
    })
  }
  return challenges
}

/** Strip any `<lib-*>` tags, leaving inner markdown (malformed-block fallback). */
function stripLibTags(raw: string): string {
  return raw.replace(/<\/?lib-[a-z-]+\b[^>]*>/gi, '').trim()
}

/**
 * Split chapter content into alternating markdown, quiz, and challenge segments.
 * Quiz and challenge blocks are authored as `<lib-quiz>` / `<lib-challenge>`
 * custom elements; everything between/around them is a markdown segment.
 */
export function splitContentIntoSegments(content: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  const blockRe = /<lib-(quiz|challenge)\b[^>]*>[\s\S]*?<\/lib-\1>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = blockRe.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index).trim()
    if (before) segments.push({ type: 'markdown', content: before })

    const raw = match[0]
    if (match[1] === 'quiz') {
      const { title, questions } = parseLibQuiz(raw)
      if (questions.length > 0) segments.push({ type: 'quiz', title, questions })
      else {
        const md = stripLibTags(raw)
        if (md) segments.push({ type: 'markdown', content: md })
      }
    } else {
      const challenges = parseLibChallenge(raw)
      if (challenges.length > 0) segments.push({ type: 'challenge', challenges })
      else {
        const md = stripLibTags(raw)
        if (md) segments.push({ type: 'markdown', content: md })
      }
    }

    lastIndex = blockRe.lastIndex
  }

  const tail = content.slice(lastIndex).trim()
  if (tail) segments.push({ type: 'markdown', content: tail })

  return segments
}
