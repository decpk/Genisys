import { useMemo, useState } from 'react'
import { HelpCircle } from 'lucide-react'

import { AIActionBlock } from '../AIActionBlock/AIActionBlock'
import {
  parseAIActions,
  parsePartialAIActions,
} from '../AIActionBlock/parseActions'
import type {
  AIActionHandler,
  AIActionId,
} from '../AIActionBlock/AIActionBlock.types'

import { AIQuestionBlock } from './AIQuestionBlock'
import {
  hasAIQuestions,
  parseAIQuestions,
  parsePartialAIQuestions,
} from './parseQuestions'
import type {
  AIQuestion,
  AIQuestionAnswer,
  ContentSegment,
} from './AIQuestionBlock.types'

export interface AssistantQuestionsContentProps {
  /** Raw assistant message content (may include the ```ai-questions fence). */
  content: string
  /** True while the message is still streaming. */
  isStreaming?: boolean
  /** Stable id used as React key for the question wizard. */
  messageId: string
  /** True when the user has already submitted answers for this message. */
  isAnswered?: boolean
  /**
   * Called when the user submits answers from the wizard. Surfaces typically
   * format these via `formatQAResponse` and send the result as a follow-up
   * user message.
   */
  onSubmitAnswers?: (
    answers: AIQuestionAnswer[],
    questions: AIQuestion[],
  ) => void
  /** Optional executor for `function_confirm` questions. */
  onExecuteFunction?: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<string>
  /** Surface-specific markdown renderer (ChatAnswer, MarkdownRenderer, …). */
  renderMarkdown: (content: string, opts?: { isStreaming?: boolean }) => React.ReactNode
  /**
   * Called when the user activates an action button from a `ai-actions`
   * directive. Surfaces forward this to their send/agent-mode plumbing.
   * When omitted, action buttons are hidden even if the fence is present.
   */
  onAction?: AIActionHandler
  /** True once the user has clicked one of the action buttons. */
  isActionResolved?: boolean
  /** Which action was resolved (so the surface can render the chosen pill). */
  resolvedActionId?: AIActionId | null
}

/**
 * Shared assistant-message content renderer with `ai-questions` awareness.
 *
 * - During streaming: hides the raw ```ai-questions JSON and shows a
 *   `Preparing questions… X of N` placeholder with a progress bar.
 * - After streaming: renders an interactive `<AIQuestionBlock />` wizard.
 * - When no questions are present: delegates entirely to `renderMarkdown`.
 *
 * Used by both the full Chat app and every AI Assistant right-panel surface
 * so the UX stays consistent.
 */
export function AssistantQuestionsContent(
  props: AssistantQuestionsContentProps,
): React.JSX.Element {
  const {
    content,
    isStreaming = false,
    messageId,
    isAnswered = false,
    onSubmitAnswers,
    onExecuteFunction,
    renderMarkdown,
    onAction,
    isActionResolved = false,
    resolvedActionId = null,
  } = props

  // Strip the `ai-actions` fence up-front so neither the streaming preview
  // nor the post-stream renderer ever sees the raw JSON. We keep the parsed
  // directive separately so we can render the action row below.
  const { displayContent, actionDirective } = useMemo(() => {
    if (isStreaming) {
      const partial = parsePartialAIActions(content)
      // While streaming we never reveal the directive — it might still be
      // partial JSON. We only strip the leading fence from the visible text.
      return {
        displayContent: partial.hasFence ? partial.intro : content,
        actionDirective: null,
      }
    }
    const parsed = parseAIActions(content)
    return {
      displayContent: parsed.markdown.length > 0 ? parsed.markdown : content,
      actionDirective: parsed.directive,
    }
  }, [content, isStreaming])

  const showActions = !isStreaming && !!actionDirective && !!onAction
  const actionsNode =
    showActions && actionDirective && onAction ? (
      <AIActionBlock
        directive={actionDirective}
        isResolved={isActionResolved}
        resolvedAction={resolvedActionId}
        onAction={onAction}
      />
    ) : null

  // When an `ai-actions` row is rendering on this same message, treat the
  // action buttons as the canonical "what next?" gate and hide any duplicate
  // `confirm`-type inline questions — they ask the same yes/no twice and
  // confuse users. Mid-flow clarifications (`single_choice`, `multi_choice`,
  // `text`, `function_confirm`) still render normally. Suppression stays on
  // after the action row is resolved so previously-hidden confirms don't
  // suddenly pop into view.
  const suppressConfirmQuestions = showActions

  const shouldParse = !isStreaming && hasAIQuestions(displayContent)

  if (!shouldParse) {
    if (isStreaming) {
      const partial = parsePartialAIQuestions(displayContent)
      if (partial.hasFence) {
        const total = partial.total
        const received = partial.questions.length

        let progressLabel = 'Preparing questions…'
        if (total && total > 0) {
          progressLabel = `Preparing questions… ${Math.min(received, total)} of ${total}`
        } else if (received > 0) {
          progressLabel = `Preparing questions… ${received} ready`
        }

        return (
          <>
            {partial.intro.trim() &&
              renderMarkdown(partial.intro, { isStreaming: true })}
            <div className="inline-flex items-center gap-1.5 h-6 rounded-md px-2 text-[11px] font-medium text-muted-foreground/70">
              <HelpCircle size={10} className="shrink-0" />
              <span>{progressLabel}</span>
              {total && total > 0 && (
                <span
                  className="ml-1 inline-block h-1 w-16 rounded-full bg-foreground/10 overflow-hidden align-middle"
                  aria-hidden
                >
                  <span
                    className="block h-full bg-primary/70 transition-all duration-200"
                    style={{
                      width: `${Math.min(100, Math.round((Math.min(received, total) / total) * 100))}%`,
                    }}
                  />
                </span>
              )}
            </div>
          </>
        )
      }
    }
    return (
      <>
        {renderMarkdown(displayContent, { isStreaming })}
        {actionsNode}
      </>
    )
  }

  return (
    <>
      <PostStreamContent
        content={displayContent}
        messageId={messageId}
        isAnswered={isAnswered}
        onSubmitAnswers={onSubmitAnswers}
        onExecuteFunction={onExecuteFunction}
        renderMarkdown={renderMarkdown}
        suppressConfirmQuestions={suppressConfirmQuestions}
      />
      {actionsNode}
    </>
  )
}

function PostStreamContent({
  content,
  messageId,
  isAnswered,
  onSubmitAnswers,
  onExecuteFunction,
  renderMarkdown,
  suppressConfirmQuestions = false,
}: {
  content: string
  messageId: string
  isAnswered: boolean
  onSubmitAnswers?: (
    answers: AIQuestionAnswer[],
    questions: AIQuestion[],
  ) => void
  onExecuteFunction?: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<string>
  renderMarkdown: (content: string, opts?: { isStreaming?: boolean }) => React.ReactNode
  /**
   * When true, `confirm`-type questions are stripped from the parsed
   * segments so they don't render. Used by the parent when an `ai-actions`
   * row is already rendering for the same message (the Implement / Refine /
   * Cancel buttons ARE the yes/no).
   */
  suppressConfirmQuestions?: boolean
}): React.JSX.Element {
  const segments = useMemo<ContentSegment[]>(() => {
    const raw = parseAIQuestions(content)
    if (!suppressConfirmQuestions) return raw
    const filtered: ContentSegment[] = []
    for (const seg of raw) {
      if (seg.type !== 'questions' || !seg.questions) {
        filtered.push(seg)
        continue
      }
      const keep = seg.questions.filter((q) => q.type !== 'confirm')
      if (keep.length === 0) continue
      filtered.push({ ...seg, questions: keep })
    }
    return filtered
  }, [content, suppressConfirmQuestions])
  const [showQuestions, setShowQuestions] = useState(true)
  const hasQuestionSegments = segments.some((s) => s.type === 'questions')
  const noopSubmit = () => {}

  return (
    <>
      {hasQuestionSegments && (
        <button
          type="button"
          onClick={() => setShowQuestions((v) => !v)}
          className="inline-flex items-center gap-1.5 h-6 rounded-md px-2 text-[11px] font-medium transition-all cursor-pointer text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5"
        >
          <HelpCircle size={10} className="shrink-0" />
          <span>{showQuestions ? 'Questions' : 'Questions hidden'}</span>
        </button>
      )}
      {segments.map((seg, i) =>
        seg.type === 'questions' && seg.questions
          ? showQuestions && (
              <AIQuestionBlock
                key={`${messageId}-questions`}
                questions={seg.questions}
                messageId={messageId}
                isAnswered={isAnswered}
                onSubmitAnswers={onSubmitAnswers ?? noopSubmit}
                onExecuteFunction={onExecuteFunction}
              />
            )
          : (
              <div key={`m-${i}`}>{renderMarkdown(seg.content)}</div>
            ),
      )}
    </>
  )
}
