import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { User, Copy, Check, ArrowUp, ArrowDown, RotateCw, ChevronRight, ChevronDown, HelpCircle, Navigation, BookOpen } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { SpeakerButton } from '@/components/TextToSpeech'
import { useCommandStore } from '@/store/command-store'
import { parseMarkdownToChapters } from '@/components/Library/md-book-parser'
import { extractTitleFromMarkdown } from '@/components/Library/NewBookDialog/NewBookDialog.constants'
import { useLibraryStore } from '@/store/library-store'
import { useNavigationStore } from '@/store/navigation-store'
import { notify, scopedToast } from '@/frameworks/notification'

const toast = scopedToast('chat')
import {
  AIPlanProgress,
  MessageActionBar,
  extractImpliedPlanSteps,
  parseAIPlan,
  stripAIPlanMarkers,
  type MessageAction,
} from '@/lib/chat-ui'
import { parseCommandTokens } from '../../utils/parseCommands'

import { ProviderIcon } from '../ModelSelector/ProviderIcon'
import { getProviderFromModelId } from '../ModelSelector/ModelSelector.constants'
import { ToolCallBlock } from '../ToolCallBlock'
import { CrawlNavFooter } from '../CrawlNavFooter'
import { AIQuestionBlock, parseAIQuestions, parsePartialAIQuestions, hasAIQuestions, formatQAResponse } from '../AIQuestionBlock'
import type { AIQuestionAnswer, AIQuestion } from '../AIQuestionBlock'
import { AIActionBlock, parseAIActions, parsePartialAIActions } from '../AIActionBlock'
import type {
  AIActionDirective,
  AIActionHandler,
  AIActionId,
} from '../AIActionBlock'
import { ChatAnswer } from './ChatAnswer'
import { ChatMessageImages } from './ChatMessageImages'
import type { ChatMessageBubbleProps } from './ChatMessageBubble.types'

/**
 * Returns true when the element is taller than the viewport,
 * plus tiny scroll-position flags so we can hide the arrow
 * that's already at the edge.
 */
function useOverflows(ref: React.RefObject<HTMLDivElement | null>) {
  const [overflows, setOverflows] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(false)

  const check = useCallback(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    setOverflows(rect.height > vh * 0.85)
    setAtTop(rect.top >= 0)
    setAtBottom(rect.bottom <= vh)
  }, [ref])

  useEffect(() => {
    check()
    // re-check after content renders / images load
    const id = setTimeout(check, 300)

    // re-check on scroll of the nearest scrollable ancestor
    const scrollParent = ref.current?.closest('[class*="overflow-y"]') as HTMLElement | null
    scrollParent?.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    return () => {
      clearTimeout(id)
      scrollParent?.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [check, ref])

  return { overflows, atTop, atBottom }
}

// ── Section visibility toggle ───────────────────────────────────

function SectionToggle({
  visible,
  onToggle,
  icon: Icon,
  label,
  collapsedLabel,
}: {
  visible: boolean
  onToggle: () => void
  icon: React.ElementType
  label: string
  collapsedLabel: string
}): React.JSX.Element {
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 h-6 rounded-md px-2 text-[11px] font-medium transition-all cursor-pointer text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5"
    >
      {visible ? (
        <ChevronDown size={10} className="shrink-0 transition-transform duration-150" />
      ) : (
        <ChevronRight size={10} className="shrink-0 transition-transform duration-150" />
      )}
      <Icon size={10} className="shrink-0" />
      <span>{visible ? label : collapsedLabel}</span>
    </button>
  )
}

export function ChatMessageBubble({
  message,
  isStreaming,
  widthStyle,
  modelId = 'claude-sonnet-4',
  toolCalls = [],
  preToolContent = '',
  onResend,
  crawlNavLinks,
  onCrawlNavigate,
  answeredMessageIds,
  onExecuteFunction,
  onAction,
  resolvedActionMessageIds,
  resolvedActionByMessageId,
}: ChatMessageBubbleProps): React.JSX.Element {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [localAnswered, setLocalAnswered] = useState(false)
  const [showQuestions, setShowQuestions] = useState(true)
  const [showCrawlNav, setShowCrawlNav] = useState(true)
  const provider = getProviderFromModelId(modelId)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const { overflows, atTop, atBottom } = useOverflows(bubbleRef)

  const isAnswered = localAnswered || (answeredMessageIds?.has(message.id) ?? false)
  const isActionResolved =
    resolvedActionMessageIds?.has(message.id) ?? false
  const resolvedActionId =
    resolvedActionByMessageId?.get(message.id) ?? null

  // ── Plan-first rendering ─────────────────────────────────────────
  // When the assistant publishes an `ai-plan` fence we render the VS Code
  // "Todos" card on top of the bubble. Tool calls *always* render as the
  // collapsed `expandable` audit trail regardless of plan presence — the
  // step-progress timeline is reserved for plan todos, not raw tool calls.
  // The plan fence + per-step HTML-comment markers are stripped from the
  // prose flowing into the markdown renderer.
  //
  // When the model did NOT emit a fence but its prose contains a sequence
  // of task-like labels (e.g. "**Commit 1/9**: …**Commit 2/9**: …" on a
  // single run-on line) we lift those into the same Todos card as an
  // *implicit* plan and strip them from the prose so they render as a
  // readable list instead of a wall of text.
  const planParse = useMemo(
    () => parseAIPlan(message.content),
    [message.content],
  )
  const implicitPlanFromMessage = useMemo(
    () =>
      planParse.hasPlan
        ? null
        : extractImpliedPlanSteps(stripAIPlanMarkers(message.content)),
    [message.content, planParse.hasPlan],
  )
  const planSteps = planParse.hasPlan
    ? planParse.steps
    : (implicitPlanFromMessage?.steps ?? [])
  const showPlan = planSteps.length > 0
  const cleanedPreToolContent = useMemo(() => {
    const stripped = stripAIPlanMarkers(preToolContent)
    if (!implicitPlanFromMessage || implicitPlanFromMessage.steps.length === 0) {
      return stripped
    }
    return extractImpliedPlanSteps(stripped).cleanedContent
  }, [preToolContent, implicitPlanFromMessage])
  const cleanedAssistantContent = useMemo(() => {
    const raw =
      preToolContent && toolCalls.length > 0
        ? (message.content || ' ').slice(preToolContent.length) || ' '
        : message.content || ' '
    const stripped = stripAIPlanMarkers(raw)
    const afterImplicit =
      implicitPlanFromMessage && implicitPlanFromMessage.steps.length > 0
        ? extractImpliedPlanSteps(stripped).cleanedContent
        : stripped
    return afterImplicit.length > 0 ? afterImplicit : ' '
  }, [message.content, preToolContent, toolCalls.length, implicitPlanFromMessage])

  // Show only one streaming indicator: pre-tool text is frozen and the
  // post-tool block is empty while tools run, so suppress it until tools end.
  const toolsRunning = toolCalls.some((tc) => tc.status === 'running')

  const handleSubmitAnswers = useCallback(
    (answers: AIQuestionAnswer[], questions: AIQuestion[]) => {
      setLocalAnswered(true)
      if (onResend) {
        const response = formatQAResponse(questions, answers)
        onResend(response)
      }
    },
    [onResend],
  )

  const scrollToStart = useCallback(() => {
    bubbleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const scrollToEnd = useCallback(() => {
    bubbleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  const handleCopy = useCallback((): void => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Copied to clipboard', { duration: 1500 })
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  const handleAddToLibrary = useCallback(async () => {
    const content = message.content
    if (!content) return

    const chapters = parseMarkdownToChapters(content)
    if (chapters.length === 0) return

    const extracted = extractTitleFromMarkdown(content)
    const title = extracted !== 'Untitled Book'
      ? extracted
      : content.slice(0, 50).replace(/\n/g, ' ').trim() || 'Chat Response'

    const { createBook, addChapter, updateBookStatus } = useLibraryStore.getState()
    const book = await createBook(title)

    for (const ch of chapters) {
      await addChapter({
        bookId: book.id,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        content: ch.content,
        status: 'completed',
        sortOrder: ch.chapterNumber,
        isRead: false,
      })
    }

    await updateBookStatus(book.id, 'completed')
    notify({
      type: 'success',
      source: 'chat',
      message: `"${title}" added to Library`,
      actions: [
        {
          label: 'Open in Library',
          onClick: () => useNavigationStore.getState().openLibraryBook(book.id),
        },
      ],
    })
  }, [message.content])

  // Shared action descriptors — fed into <MessageActionBar />.
  let copyIconNode: React.ReactNode = <Copy size={12} />
  if (copied) copyIconNode = <Check size={12} className="text-success" />
  const copyLabel = copied ? 'Copied!' : 'Copy'

  const userActions = useMemo<MessageAction[]>(
    () => [
      {
        key: 'resend',
        icon: <RotateCw size={12} />,
        label: 'Resend',
        onClick: () => onResend?.(message.content),
        hidden: !onResend,
      },
      { key: 'copy', icon: copyIconNode, label: copyLabel, onClick: handleCopy },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- icon node rebuilt per render based on `copied`
    [copied, handleCopy, message.content, onResend],
  )

  const assistantActions = useMemo<MessageAction[]>(
    () => [
      { key: 'copy', icon: copyIconNode, label: copyLabel, onClick: handleCopy },
      {
        key: 'library',
        icon: <BookOpen size={12} />,
        label: 'Add to Library',
        tooltip: 'Add to Library',
        onClick: handleAddToLibrary,
      },
      { key: 'speak', node: <SpeakerButton text={message.content} size={12} /> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- icon node rebuilt per render based on `copied`
    [copied, handleCopy, handleAddToLibrary, message.content],
  )

  return (
    <div
      ref={bubbleRef}
      className={`group mx-auto flex flex-col gap-1 relative`}
      style={widthStyle}
      data-message-id={message.id}
    >
      {/* User: scoped hover group so actions only show on user message hover */}
      {isUser && (
        <div className="flex flex-col gap-1 items-end">
          <div className="flex items-center gap-1.5 flex-row-reverse">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
              <User size={14} className="text-primary" />
            </div>
            <MessageActionBar actions={userActions} variant="labeled" />
          </div>
          <div className="max-w-[90%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-primary/80 text-primary-foreground shadow-sm">
            {message.images && message.images.length > 0 && (
              <ChatMessageImages filenames={message.images} />
            )}
            <UserMessageContent content={message.content} />
          </div>
        </div>
      )}
      {/* AI: icon always at top, controls alongside when bottom is not visible */}
      {!isUser && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
              <ProviderIcon
                provider={provider}
                size={14}
                className="text-primary"
              />
            </div>
            {!atBottom && !isStreaming && message.content && (
              <MessageActionBar actions={assistantActions} variant="labeled" />
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="rounded-2xl px-4 py-3 bg-muted border border-border/20 rounded-tl-sm">
              <>
                {/* Plan-first: when the assistant declared a step plan via
                    an `ai-plan` fence (or emitted an implicit task sequence
                    in prose), render the progress card on top and fall back
                    to the collapsed tool-call audit trail below. */}
                {showPlan && (
                  <AIPlanProgress steps={planSteps} />
                )}
                {/* Interleaved tool calls: pre-tool text → tools → post-tool text */}
                {preToolContent && toolCalls.length > 0 && (
                  <ChatAnswer
                    content={cleanedPreToolContent}
                    isStreaming={false}
                  />
                )}
                {toolCalls.length > 0 && (
                  <ToolCallBlock toolCalls={toolCalls} mode="expandable" />
                )}
                <AssistantContent
                  content={cleanedAssistantContent}
                  isStreaming={isStreaming && !toolsRunning}
                  messageId={message.id}
                  isAnswered={isAnswered}
                  onSubmitAnswers={handleSubmitAnswers}
                  onExecuteFunction={onExecuteFunction}
                  showQuestions={showQuestions}
                  onToggleQuestions={() => setShowQuestions((v) => !v)}
                  onAction={onAction}
                  isActionResolved={isActionResolved}
                  resolvedActionId={resolvedActionId}
                />
                {!isStreaming && crawlNavLinks && onCrawlNavigate && (
                  <div>
                    <SectionToggle
                      visible={showCrawlNav}
                      onToggle={() => setShowCrawlNav((v) => !v)}
                      icon={Navigation}
                      label="Navigation"
                      collapsedLabel="Navigation hidden"
                    />
                    {showCrawlNav && (
                      <CrawlNavFooter
                        navLinks={crawlNavLinks}
                        onNavigate={onCrawlNavigate}
                      />
                    )}
                  </div>
                )}
              </>
            </div>
            {/* AI: controls only at bottom when bottom is visible */}
            {atBottom && !isStreaming && message.content && (
              <MessageActionBar actions={assistantActions} variant="labeled" />
            )}
          </div>
        </div>
      )}
      {/* Scroll-within-message buttons for long messages — left edge, vertically centered */}
      {overflows && !isStreaming && (
        <div className="absolute -left-3 top-0 bottom-0 w-0 z-10 pointer-events-none">
          <div className="sticky top-1/2 -translate-y-1/2 -translate-x-full pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-1">
              {!atTop && (
                <Tooltip
                  content="Scroll to start of message"
                  side="left"
                >
                  <button
                    onClick={scrollToStart}
                    className="w-6 h-6 aspect-square rounded-full bg-foreground/20 border border-border text-foreground hover:bg-foreground/30 shadow-md transition-all cursor-pointer flex items-center justify-center group/btn"
                  >
                    <ArrowUp
                      size={10}
                      className="group-hover/btn:animate-bounce"
                      style={{ animationDuration: "1.5s" }}
                    />
                  </button>
                </Tooltip>
              )}
              {!atBottom && (
                <Tooltip
                  content="Scroll to end of message"
                  side="left"
                >
                  <button
                    onClick={scrollToEnd}
                    className="w-6 h-6 aspect-square rounded-full bg-foreground/20 border border-border text-foreground hover:bg-foreground/30 shadow-md transition-all cursor-pointer flex items-center justify-center group/btn"
                  >
                    <ArrowDown
                      size={10}
                      className="group-hover/btn:animate-bounce"
                      style={{ animationDuration: "1.5s" }}
                    />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Assistant content with AI question detection ────────────────

function AssistantContent({
  content,
  isStreaming,
  messageId,
  isAnswered,
  onSubmitAnswers,
  onExecuteFunction,
  showQuestions,
  onToggleQuestions,
  onAction,
  isActionResolved,
  resolvedActionId,
}: {
  content: string
  isStreaming?: boolean
  messageId: string
  isAnswered: boolean
  onSubmitAnswers: (answers: AIQuestionAnswer[], questions: AIQuestion[]) => void
  onExecuteFunction?: (functionName: string, args: Record<string, unknown>) => Promise<string>
  showQuestions: boolean
  onToggleQuestions: () => void
  onAction?: AIActionHandler
  isActionResolved?: boolean
  resolvedActionId?: AIActionId | null
}): React.JSX.Element {
  // Strip `ai-actions` fence first so the rest of the rendering logic never
  // sees raw JSON. Keep the parsed directive separately to render below.
  let displayContent = content
  let actionDirective: AIActionDirective | null = null

  if (isStreaming) {
    const partial = parsePartialAIActions(content)
    if (partial.hasFence) displayContent = partial.intro
  } else {
    const parsed = parseAIActions(content)
    actionDirective = parsed.directive
    if (parsed.markdown.length > 0) displayContent = parsed.markdown
  }

  const showActions = !isStreaming && !!actionDirective && !!onAction
  const actionsNode =
    showActions && actionDirective && onAction ? (
      <AIActionBlock
        directive={actionDirective}
        isResolved={isActionResolved ?? false}
        resolvedAction={resolvedActionId ?? null}
        onAction={onAction}
      />
    ) : null

  // During streaming, don't parse incomplete code blocks
  const shouldParse = !isStreaming && hasAIQuestions(displayContent)

  if (!shouldParse) {
    // While streaming, hide the raw ```ai-questions JSON so users don't see
    // unformatted content flash before the rich question UI renders. We still
    // show progress (X of N ready) but wait until streaming completes before
    // rendering the interactive question wizard.
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
            {partial.intro.trim() && (
              <ChatAnswer content={partial.intro} isStreaming={isStreaming} />
            )}
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
                    style={{ width: `${Math.min(100, Math.round((Math.min(received, total) / total) * 100))}%` }}
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
        <ChatAnswer content={displayContent} isStreaming={isStreaming} />
        {actionsNode}
      </>
    )
  }

  const segments = parseAIQuestions(displayContent)
  const hasQuestionSegments = segments.some((s) => s.type === 'questions')

  return (
    <>
      {hasQuestionSegments && (
        <SectionToggle
          visible={showQuestions}
          onToggle={onToggleQuestions}
          icon={HelpCircle}
          label="Questions"
          collapsedLabel="Questions hidden"
        />
      )}
      {segments.map((seg, i) =>
        seg.type === 'questions' && seg.questions ? (
          showQuestions && (
            <AIQuestionBlock
              key={`${messageId}-questions`}
              questions={seg.questions}
              messageId={messageId}
              isAnswered={isAnswered}
              onSubmitAnswers={onSubmitAnswers}
              onExecuteFunction={onExecuteFunction}
            />
          )
        ) : (
          <ChatAnswer key={`m-${i}`} content={seg.content} />
        ),
      )}
      {actionsNode}
    </>
  )
}

// ── User message with command highlighting ──────────────────────

function UserMessageContent({ content }: { content: string }): React.JSX.Element {
  const commands = useCommandStore((s) => s.commands)
  const segments = useMemo(() => parseCommandTokens(content, commands), [content, commands])

  if (content.startsWith('Here are my answers:\n\n')) {
    return (
      <p className="text-xs text-muted-foreground/80 italic select-text">✓ Answered questions above</p>
    )
  }

  const hasCommands = segments.some((s) => s.type === 'command')
  if (!hasCommands) {
    return <p className="whitespace-pre-wrap select-text text-sm">{content}</p>
  }

  return (
    <p className="whitespace-pre-wrap select-text text-sm">
      {segments.map((seg, i) =>
        seg.type === "command" ? (
          <span
            key={i}
            className="bg-primary/10 text-primary rounded-md px-1.5 py-0.5 font-medium text-[13px]"
          >
            {seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </p>
  );
}
