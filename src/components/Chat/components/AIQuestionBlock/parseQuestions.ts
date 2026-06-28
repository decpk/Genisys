import type { AIQuestion, AIQuestionAnswer, ContentSegment } from './AIQuestionBlock.types'

const AI_QUESTIONS_RE = /```ai-questions\s*\n([\s\S]*?)```/g

export function hasAIQuestions(content: string): boolean {
  return /```ai-questions\s*\n[\s\S]*?```/.test(content)
}

export function parseAIQuestions(content: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  let lastIndex = 0

  // Reset regex state
  AI_QUESTIONS_RE.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = AI_QUESTIONS_RE.exec(content)) !== null) {
    // Add markdown segment before this match
    if (match.index > lastIndex) {
      const markdown = content
        .slice(lastIndex, match.index)
        // Strip the streaming-progress marker so it doesn't render as raw text.
        .replace(/<!--\s*ai-questions-total:\s*\d+\s*-->/gi, '')
        .trim()
      if (markdown) {
        segments.push({ type: 'markdown', content: markdown })
      }
    }

    // Parse JSON from the code block
    const jsonStr = match[1].trim()
    try {
      const parsed = JSON.parse(jsonStr)
      const questions = validateQuestions(parsed)
      if (questions.length > 0) {
        segments.push({ type: 'questions', content: match[0], questions })
      } else {
        // Invalid questions — show as markdown
        segments.push({ type: 'markdown', content: match[0] })
      }
    } catch {
      // Malformed JSON — show as markdown
      segments.push({ type: 'markdown', content: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining markdown after last match
  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex).trim()
    if (remaining) {
      segments.push({ type: 'markdown', content: remaining })
    }
  }

  // If no matches found, return the whole content as markdown
  if (segments.length === 0) {
    segments.push({ type: 'markdown', content })
  }

  return segments
}

function validateQuestions(data: unknown): AIQuestion[] {
  if (!Array.isArray(data)) return []

  return data.filter((item): item is AIQuestion => {
    if (!item || typeof item !== 'object') return false
    if (typeof item.id !== 'string' || !item.id) return false
    if (typeof item.question !== 'string' || !item.question) return false
    if (!['confirm', 'single_choice', 'multi_choice', 'text', 'function_confirm'].includes(item.type)) return false
    if ((item.type === 'single_choice' || item.type === 'multi_choice') && !Array.isArray(item.options)) return false
    if (item.type === 'function_confirm' && (!item.functionCall || typeof item.functionCall.name !== 'string')) return false
    return true
  })
}

// ── Streaming-time partial parser ────────────────────────────────

export interface PartialAIQuestionsResult {
  /** Markdown intro before the fence (with the total marker stripped). */
  intro: string
  /** Fully-formed question objects parsed so far. */
  questions: AIQuestion[]
  /** Total number of questions the assistant declared up front (if any). */
  total: number | null
  /** True when an `\`\`\`ai-questions` opener has been seen in the stream. */
  hasFence: boolean
}

/**
 * Parse an in-flight assistant message and extract any complete question
 * objects from the (possibly unclosed) `ai-questions` fenced block. Used so
 * users can start answering as questions stream in instead of waiting for
 * the whole batch.
 */
export function parsePartialAIQuestions(content: string): PartialAIQuestionsResult {
  const fenceIdx = content.indexOf('```ai-questions')
  if (fenceIdx === -1) {
    return { intro: content, questions: [], total: null, hasFence: false }
  }

  const totalMatch = content.match(/<!--\s*ai-questions-total:\s*(\d+)\s*-->/i)
  const total = totalMatch ? Number(totalMatch[1]) : null
  const introCutoff =
    totalMatch && typeof totalMatch.index === 'number' && totalMatch.index < fenceIdx
      ? totalMatch.index
      : fenceIdx
  const intro = content.slice(0, introCutoff).replace(/\s+$/, '')

  // Skip past the opener line (```ai-questions\n).
  const afterFence = content.slice(fenceIdx + '```ai-questions'.length)
  const newlineIdx = afterFence.indexOf('\n')
  const body = newlineIdx === -1 ? '' : afterFence.slice(newlineIdx + 1)

  // Walk the body collecting balanced top-level `{...}` objects (the items
  // of the JSON array). String / escape tracking avoids matching braces
  // that sit inside string literals.
  const questions: AIQuestion[] = []
  let depth = 0
  let inString = false
  let escape = false
  let start = -1
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    // Stop at the closing fence so we don't scan trailing content.
    if (ch === '`' && body.slice(i, i + 3) === '```') break
    if (ch === '{') {
      if (depth === 0) start = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        const slice = body.slice(start, i + 1)
        try {
          const obj = JSON.parse(slice)
          const valid = validateQuestions([obj])
          if (valid.length === 1) questions.push(valid[0])
        } catch {
          /* incomplete or malformed — ignore */
        }
        start = -1
      }
    }
  }

  return { intro, questions, total, hasFence: true }
}

export function formatQAResponse(questions: AIQuestion[], answers: AIQuestionAnswer[]): string {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]))

  const lines = questions.map((q, i) => {
    const answer = answerMap.get(q.id)
    const answerText = formatAnswer(answer)
    return `**Q${i + 1}. ${q.question}**\n→ ${answerText}`
  })

  return `Here are my answers:\n\n${lines.join('\n\n')}`
}

function formatAnswer(answer: AIQuestionAnswer | undefined): string {
  if (!answer) return '_No answer_'

  const val = answer.answer
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (Array.isArray(val)) return val.join(', ')
  return String(val)
}
