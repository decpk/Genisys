import { memo, useCallback, useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { SpeakerButton } from '@/components/TextToSpeech'
import { copyToClipboard } from '@/lib/clipboard'
import {
  AIPlanProgress,
  MessageActionBar,
  extractImpliedPlanSteps,
  parseAIPlan,
  stripAIPlanMarkers,
  type MessageAction,
} from '@/lib/chat-ui'
import { AssistantQuestionsContent } from '@/components/Chat/components/AIQuestionBlock'
import { messageBubbleStyles as styles } from '../AIAssistantPanel.styles'
import { ReasoningDisclosure } from '../ReasoningDisclosure'
import { ToolActivityList } from '../ToolActivityList'
import { InsertVisualButton } from './InsertVisualButton'
import { extractVisualBlocks } from './utils/extractVisualBlocks'
import type { MessageBubbleProps } from './MessageBubble.types'

const COPIED_RESET_MS = 2000

function AbuDhabiSeparator(): React.JSX.Element {
  return (
    <div className={styles.separatorWrapper}>
      <div className={styles.separatorLine} />
      <svg width="12" height="12" viewBox="0 0 12 12" className={styles.separatorIcon}>
        <path
          d="M6 0 L8.5 3.5 L12 6 L8.5 8.5 L6 12 L3.5 8.5 L0 6 L3.5 3.5 Z"
          fill="currentColor"
        />
      </svg>
      <div className={styles.separatorLineReverse} />
    </div>
  )
}

export const MessageBubble = memo(function MessageBubble(
  props: MessageBubbleProps,
): React.JSX.Element | null {
  const {
    message,
    showSeparator,
    onSubmitAnswers,
    onAction,
    isActionResolved,
    resolvedActionId,
    onInsertToEditor,
  } = props
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    copyToClipboard(message.content, 'Message')
    setCopied(true)
    setTimeout(() => setCopied(false), COPIED_RESET_MS)
  }, [message.content])

  let copyIcon: React.ReactNode = <Copy size={12} />
  if (copied) copyIcon = <Check size={12} className="text-green-500" />
  const copyTooltip = copied ? 'Copied!' : 'Copy message'

  const actions = useMemo<MessageAction[]>(
    () => [
      { key: 'copy', icon: copyIcon, tooltip: copyTooltip, onClick: handleCopy },
      {
        key: 'speak',
        node: <SpeakerButton text={message.content} size={12} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- copyIcon is rebuilt per render but stable in identity for given `copied`
    [copied, handleCopy, message.content],
  )

  if (message.role === 'user') {
    return (
      <>
        {showSeparator && <AbuDhabiSeparator />}
        <div className={`${styles.userWrapper} group`} data-role="user">
          <div className={styles.userInner}>
            <div className={styles.userBubble}>{message.content}</div>
            <MessageActionBar actions={actions} variant="iconOnly" />
          </div>
        </div>
      </>
    )
  }

  const displayContent = message.content.trim()
  if (!displayContent) return null

  const visualBlocks = extractVisualBlocks(message.content)
  const showInsert = Boolean(onInsertToEditor) && visualBlocks.length > 0

  const hasReasoning = Boolean(message.reasoning && message.reasoning.length > 0)
  const hasActivities = Boolean(
    message.activities && message.activities.length > 0,
  )

  // ── Plan-first rendering ─────────────────────────────────────────
  // When the assistant publishes an `ai-plan` fence we render the VS Code
  // "Todos" card on top of the bubble. Tool calls *always* render as the
  // collapsed `expandable` audit trail regardless of plan presence — the
  // step-progress timeline is reserved for plan todos, not raw tool calls.
  // The fence + per-step HTML-comment markers are stripped from the prose
  // flowing into the markdown renderer.
  //
  // When the model did NOT emit a fence but the prose contains a sequence
  // of task-like labels (e.g. "**Commit 1/9**: …**Commit 2/9**: …" on a
  // single run-on line) we lift those into the same Todos card as an
  // *implicit* plan and strip them from the prose so they render as a
  // readable list instead of a wall of text.
  const planParse = parseAIPlan(displayContent)
  const explicitlyStripped = stripAIPlanMarkers(displayContent)
  const implicitPlan = planParse.hasPlan
    ? null
    : extractImpliedPlanSteps(explicitlyStripped)
  const planSteps = planParse.hasPlan
    ? planParse.steps
    : (implicitPlan?.steps ?? [])
  const showPlan = planSteps.length > 0
  const cleanedDisplayContent = implicitPlan
    ? implicitPlan.cleanedContent
    : explicitlyStripped

  return (
    <div className={`${styles.assistantWrapper} group`} data-role="assistant">
      <div className={styles.assistantBubble}>
        {hasReasoning && (
          <ReasoningDisclosure
            reasoning={message.reasoning ?? ''}
            isStreaming={false}
            defaultOpen={false}
          />
        )}
        {showPlan && <AIPlanProgress steps={planSteps} />}
        {hasActivities && (
          <ToolActivityList
            activities={message.activities ?? []}
            mode="expandable"
          />
        )}
        <AssistantQuestionsContent
          content={cleanedDisplayContent}
          messageId={message.id}
          onSubmitAnswers={onSubmitAnswers}
          renderMarkdown={(c) => (
            <MarkdownRenderer content={c} enableCitations />
          )}
          onAction={onAction}
          isActionResolved={isActionResolved}
          resolvedActionId={resolvedActionId}
        />
      </div>
      {showInsert && onInsertToEditor && (
        <InsertVisualButton blocks={visualBlocks} onInsert={onInsertToEditor} />
      )}
      <MessageActionBar actions={actions} variant="iconOnly" className="mt-1" />
    </div>
  )
})
