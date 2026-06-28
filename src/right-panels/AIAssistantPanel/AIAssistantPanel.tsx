import {
  ArrowDown,
  ChevronDown,
  Clock,
  MessageSquare,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { StreamingIndicator } from '@/components/ui/streaming-indicator'
import { Dropdown, type DropdownGroup } from '@/components/ui/dropdown'
import { Tooltip } from '@/components/Tooltip'
import { ModelSelector } from '@/components/Chat/components/ModelSelector'
import { PromptPicker, stripPromptTemplate } from '@/components/PromptPicker'
import type { PromptScopeApp } from '@/lib/prompt-scope'
import {
  AIPlanProgress,
  ChatComposerShell,
  ChatSurfaceHeader,
  extractImpliedPlanSteps,
  parseAIPlan,
  stripAIPlanMarkers,
} from '@/lib/chat-ui'
import { useRegisterChatSurface } from '@/keyboard-shortcut-impl'
import {
  AssistantQuestionsContent,
  formatQAResponse,
  type AIQuestion,
  type AIQuestionAnswer,
} from '@/components/Chat/components/AIQuestionBlock'

import { useAIAssistantPanelData } from './useAIAssistantPanelData'
import {
  historyStyles,
  messagesStyles,
  streamingStyles,
  inputStyles,
  followButtonStyles,
  modeSelectorStyles,
  queuedStyles,
} from './AIAssistantPanel.styles'
import { MessageBubble } from './MessageBubble'
import { ConfirmationPanel } from './ConfirmationPanel'
import { ContinuePanel } from './ContinuePanel'
import { ContextProperties } from './ContextProperties'
import { ContextScopePill } from './ContextScopePill'
import { AIEmptyState } from './AIEmptyState'
import { AIEditor } from './AIEditor'
import { ToolsInfoPopover } from './ToolsInfoPopover'
import { ToolActivityList } from './ToolActivityList'
import { ReasoningDisclosure } from './ReasoningDisclosure'
import { AssistantErrorNotice } from './AssistantErrorNotice'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export function AIAssistantPanel(): React.JSX.Element {
  const {
    messages,
    status,
    streamingContent,
    toolActivities,
    streamingReasoning,
    latestActivityLabel,
    error,
    pendingConfirm,
    pendingContinue,
    sessions,
    activeSessionId,
    contextItems,
    contextLabel,
    emptyState,
    modes,
    selectedMode,
    contextScopes,
    selectedContextScopeId,
    mentionConfig,
    placeholder,
    isStreaming,
    hasMessages,
    showScrollButton,
    toolsInfo,
    scrollRef,
    editorRef,
    sendMessage,
    confirmAction,
    cancelAction,
    continueLoop,
    stopLoop,
    onStop,
    resetSession,
    removeSession,
    clearAllSessions,
    onModeChange,
    onContextScopeChange,
    loadMoreMessages,
    handleScroll,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleNewChat,
    handleSelectSession,
    handleSubmit,
    scrollToBottom,
    isLoadingHistory,
    isLoadingMessages,
    hasMoreMessages,
    selectedModelId,
    appId,
    onModelChange,
    onActionClick,
    onInsertToEditor,
    resolvedActionMessageIds,
    resolvedActionByMessageId,
    steerEnabled,
    queuedMessages,
    removeQueuedMessage,
  } = useAIAssistantPanelData()

  // ── Register as a chat surface for Cmd/Ctrl+N (focus-scoped). ──
  const rootRef = useRef<HTMLDivElement>(null)
  useRegisterChatSurface(rootRef, handleNewChat)

  // ── History dropdown items ─────────────────────────────
  const historyGroups = useMemo<DropdownGroup[]>(() => {
    const groups: DropdownGroup[] = [
      {
        key: 'sessions',
        items: sessions.map((session) => ({
          key: session.id,
          label: session.title,
          icon:
            session.status === 'thinking' || session.status === 'executing'
              ? AppLoaderGlyph
              : MessageSquare,
          active: session.id === activeSessionId,
          onSelect: () => handleSelectSession(session.id),
          suffix: (
            <span className={historyStyles.itemSuffix}>
              <span className={historyStyles.itemTime}>
                {relativeTime(session.updatedAt)}
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Remove"
                className={historyStyles.itemRemove}
                onClick={(e) => {
                  e.stopPropagation()
                  removeSession(session.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    removeSession(session.id)
                  }
                }}
              >
                <X size={9} />
              </span>
            </span>
          ),
        })),
      },
    ]

    if (sessions.length > 0) {
      groups.push({
        key: 'actions',
        items: [
          {
            key: '__clear_all__',
            label: 'Clear all',
            icon: Trash2,
            destructive: true,
            onSelect: clearAllSessions,
          },
        ],
      })
    }

    return groups
  }, [sessions, activeSessionId, handleSelectSession, removeSession, clearAllSessions])

  // ── Mode selector ──────────────────────────────────────

  const selectedModeOption = modes?.find((m) => m.id === selectedMode)

  const modeSelectorElement =
    modes && modes.length > 0 && selectedModeOption ? (
      <>
        <Dropdown
          openOn="click"
          items={modes.map((mode) => ({
            key: mode.id,
            label: mode.label,
            description: mode.description,
            icon: mode.icon,
            active: selectedMode === mode.id,
            onSelect: () => onModeChange(mode.id),
          }))}
          side="top"
          align="left"
          menuWidth="fit-content"
          showCheck
          trigger={
            <button
              type="button"
              className={modeSelectorStyles.trigger}
            >
              <selectedModeOption.icon size={12} />
              <span className={modeSelectorStyles.label}>
                {selectedModeOption.label}
              </span>
              <ChevronDown size={9} />
            </button>
          }
        />
        <div className={inputStyles.divider} />
      </>
    ) : null

  // ── Context scope pill (e.g. Page / Notebook) ─────────

  const contextScopeElement =
    contextScopes && contextScopes.length >= 2 && onContextScopeChange ? (
      <>
        <ContextScopePill
          scopes={contextScopes}
          selectedId={selectedContextScopeId}
          onChange={onContextScopeChange}
        />
        <div className={inputStyles.divider} />
      </>
    ) : null

  // ── Model picker ───────────────────────────────────────

  const hasModelPicker = Boolean(selectedModelId && onModelChange)

  let modelPickerElement: React.ReactNode = null
  if (hasModelPicker && selectedModelId && onModelChange) {
    modelPickerElement = (
      <>
        <ModelSelector
          selectedModelId={selectedModelId}
          onModelChange={onModelChange}
        />
        <div className={inputStyles.divider} />
      </>
    )
  }

  // ── Prompt picker ──────────────────────────────────────

  let promptPickerElement: React.ReactNode = null
  if (appId) {
    promptPickerElement = (
      <>
        <PromptPicker
          appId={appId as PromptScopeApp}
          onSelect={(prompt) => {
            const text = stripPromptTemplate(prompt.content)
            if (!text) return
            editorRef.current?.insertContent(text)
          }}
        />
        <div className={inputStyles.divider} />
      </>
    )
  }

  return (
    <div ref={rootRef} className="flex flex-col h-full">
      {/* Header */}
      <ChatSurfaceHeader
        title="AI Assistant"
        actions={
          <>
            <Tooltip content="New chat" side="bottom">
              <Button
                variant="subtle"
                size="icon-xs"
                onClick={handleNewChat}
              >
                <Plus size={12} strokeWidth={2.5} />
              </Button>
            </Tooltip>
            {hasMessages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSession}
              >
                <RotateCcw size={10} className="mr-1" />
                Reset
              </Button>
            )}
          </>
        }
      />

      {/* History section */}
      {(sessions.length > 0 || isLoadingHistory) && (
        <div className={historyStyles.root}>
          <Dropdown
            openOn="click"
            groups={historyGroups}
            side="bottom"
            align="left"
            menuWidth="trigger"
            maxHeight="240px"
            showCheck={false}
            fill
            trigger={
              <button type="button" className={historyStyles.toggleButton}>
                <MessageSquare size={10} />
                <span className="font-medium">History</span>
                {isLoadingHistory ? (
                  <AppLoaderGlyph size={10} className="ml-1" />
                ) : (
                  <span className={historyStyles.count}>{sessions.length}</span>
                )}
                <ChevronDown size={10} className={historyStyles.triggerChevron} />
              </button>
            }
          />
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={messagesStyles.root}
      >
        {hasMoreMessages && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={loadMoreMessages}
              disabled={isLoadingMessages}
              className="text-[10px]"
            >
              {isLoadingMessages ? (
                <AppLoaderGlyph size={10} />
              ) : (
                "Load earlier messages"
              )}
            </Button>
          </div>
        )}

        {isLoadingMessages && !hasMessages && (
          <div className="flex items-center justify-center py-8">
            <AppLoaderGlyph size={16} className="text-muted-foreground" />
          </div>
        )}

        {!hasMessages && !isLoadingMessages && status === "idle" && (
          <AIEmptyState
            config={emptyState}
            onSuggestionClick={(text) => sendMessage(text)}
          />
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            showSeparator={msg.role === "user" && idx > 0}
            onSubmitAnswers={(answers: AIQuestionAnswer[], questions: AIQuestion[]) =>
              sendMessage(formatQAResponse(questions, answers))
            }
            onAction={
              onActionClick
                ? (actionId, opts) => onActionClick(msg.id, actionId, opts)
                : undefined
            }
            isActionResolved={resolvedActionMessageIds?.has(msg.id) ?? false}
            resolvedActionId={resolvedActionByMessageId?.get(msg.id) ?? null}
            onInsertToEditor={onInsertToEditor}
          />
        ))}

        {isStreaming && toolActivities.length > 0 && (
          <ToolActivityList activities={toolActivities} />
        )}

        {isStreaming && streamingReasoning && (
          <ReasoningDisclosure reasoning={streamingReasoning} isStreaming />
        )}

        {streamingContent && (() => {
          const streamPlan = parseAIPlan(streamingContent)
          const streamStripped = stripAIPlanMarkers(streamingContent)
          const streamImplicit = streamPlan.hasPlan
            ? null
            : extractImpliedPlanSteps(streamStripped)
          const streamSteps = streamPlan.hasPlan
            ? streamPlan.steps
            : (streamImplicit?.steps ?? [])
          const streamClean = streamImplicit
            ? streamImplicit.cleanedContent
            : streamStripped
          return (
            <div className={streamingStyles.content}>
              {streamSteps.length > 0 && <AIPlanProgress steps={streamSteps} />}
              <AssistantQuestionsContent
                content={streamClean}
                isStreaming
                messageId="__streaming__"
                renderMarkdown={(c, opts) => (
                  <MarkdownRenderer
                    content={c}
                    isStreaming={opts?.isStreaming}
                    enableCitations
                  />
                )}
              />
            </div>
          )
        })()}

        {isStreaming && !streamingContent && (
          <div className={streamingStyles.indicator}>
            <StreamingIndicator
              label={
                latestActivityLabel ??
                (streamingReasoning
                  ? "Thinking..."
                  : status === "thinking"
                    ? "Analyzing..."
                    : "Executing...")
              }
            />
          </div>
        )}

        {pendingConfirm && (
          <ConfirmationPanel
            confirm={pendingConfirm}
            onConfirm={confirmAction}
            onCancel={cancelAction}
          />
        )}

        {pendingContinue && continueLoop && stopLoop && (
          <ContinuePanel
            request={pendingContinue}
            onContinue={continueLoop}
            onStop={stopLoop}
          />
        )}

        {error && (
          <AssistantErrorNotice
            error={error}
            canResend={
              messages.length > 0 &&
              messages[messages.length - 1].role === "user"
            }
            onResend={() => {
              const lastUserMsg = messages[messages.length - 1];
              if (lastUserMsg) {
                editorRef.current?.insertText(lastUserMsg.content);
                editorRef.current?.focus();
              }
            }}
          />
        )}
      </div>

      {/* Follow output / Scroll to bottom button */}
      {showScrollButton && hasMessages && (
        <div className={followButtonStyles.wrapper}>
          <Button
            variant="default"
            size="xs"
            onClick={scrollToBottom}
            className={followButtonStyles.button}
          >
            <ArrowDown size={10} />
            {isStreaming ? "Follow output" : "Scroll to bottom"}
          </Button>
        </div>
      )}

      {/* Context properties */}
      <ContextProperties items={contextItems} label={contextLabel} />

      {/* Queued messages (steer + queue surfaces only) */}
      {steerEnabled && queuedMessages && queuedMessages.length > 0 && (
        <div className={queuedStyles.root}>
          <span className={queuedStyles.label}>
            Queued · {queuedMessages.length}
          </span>
          {queuedMessages.map((q) => (
            <div key={q.id} className={queuedStyles.chip}>
              <Clock size={10} className={queuedStyles.chipIcon} />
              <span className={queuedStyles.chipText}>{q.text}</span>
              <button
                type="button"
                aria-label="Remove queued message"
                className={queuedStyles.chipRemove}
                onClick={() => removeQueuedMessage?.(q.id)}
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <ChatComposerShell
        leftSlot={
          <>
            {modeSelectorElement}
            {contextScopeElement}
            {modelPickerElement}
            {promptPickerElement}
          </>
        }
        rightSlot={
          toolsInfo && toolsInfo.length > 0
            ? <ToolsInfoPopover tools={toolsInfo} />
            : undefined
        }
        isStreaming={isStreaming}
        onSubmit={() => handleSubmit('send')}
        onStop={onStop}
        isMicDisabled={isStreaming && !steerEnabled}
        onMicTranscript={(text) => {
          editorRef.current?.focus()
          editorRef.current?.insertText(text)
        }}
        onMicCommand={(cmd) => {
          if (cmd === 'send') handleSubmit('send')
          if (cmd === 'clear') editorRef.current?.clear()
        }}
      >
        <AIEditor
          ref={editorRef}
          onSubmit={(intent) => handleSubmit(intent)}
          isDisabled={isStreaming && !steerEnabled}
          placeholder={
            isStreaming && steerEnabled
              ? 'Steer the assistant…  (⌥Enter to queue)'
              : (placeholder ??
                (status === 'awaiting-confirmation'
                  ? 'Confirm or cancel above...'
                  : mentionConfig
                    ? `Type a message… (${mentionConfig.char ?? '@'} to mention)`
                    : 'Type a message…'))
          }
          mentionConfig={mentionConfig}
        />
      </ChatComposerShell>
    </div>
  );
}
