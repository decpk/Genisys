import { useRef, useEffect, useCallback, useState } from 'react'
import { Paperclip, File, FolderOpen, Type, ImageIcon, X } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { Tooltip } from '@/components/Tooltip'
import { useChatHistoryStore } from '@/store/chat-history-store'
import { ChatComposerShell } from '@/lib/chat-ui'
import { PromptPicker, stripPromptTemplate } from '@/components/PromptPicker'

import { ModelSelector } from '../ModelSelector'
import { AgentModeSelector } from '../AgentModeSelector'
import { ChatEditor, type ChatEditorHandle } from './ChatEditor'
import type { ChatInputProps } from './ChatInput.types'

export function ChatInput({
  onSend,
  isStreaming,
  onStop,
  widthStyle,
  selectedModelId,
  onModelChange,
  selectedAgentMode,
  onAgentModeChange,
  onBrowseFiles,
  onSelectRepo,
  onPasteText,
  sourceCount = 0
}: ChatInputProps): React.JSX.Element {
  const editorRef = useRef<ChatEditorHandle>(null)
  const historyIndexRef = useRef(-1)
  const draftRef = useRef('')
  const promptHistoryRef = useRef<string[]>([])

  // Images attached to the next message (via Cmd+V paste or the Attach Image
  // menu). Each entry holds the on-disk filename (persisted with the message)
  // and a data URL for the thumbnail preview.
  const [pendingImages, setPendingImages] = useState<
    { id: string; filename: string; dataUrl: string; name: string }[]
  >([])

  // Persist a pasted/picked image to disk and add it to the pending list.
  const attachImage = useCallback(
    async (params: { dataUrl?: string; sourcePath?: string }, name: string) => {
      try {
        const res = await window.api.saveChatImage(params)
        if (res?.success && res.filename && res.dataUrl) {
          setPendingImages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              filename: res.filename!,
              dataUrl: res.dataUrl!,
              name,
            },
          ])
        }
      } catch (err) {
        console.error('[ChatInput] failed to attach image', err)
      }
    },
    [],
  )

  const handleImagePaste = useCallback(
    (dataUrl: string, name: string) => {
      void attachImage({ dataUrl }, name)
    },
    [attachImage],
  )

  const handleAttachImageClick = useCallback(async () => {
    try {
      const res = await window.api.pickImageFile()
      if (res.success && res.data) {
        const name = res.data.split(/[\\/]/).pop() || 'image'
        await attachImage({ sourcePath: res.data }, name)
      }
    } catch (err) {
      console.error('[ChatInput] failed to pick image', err)
    }
  }, [attachImage])

  const removePendingImage = useCallback((id: string) => {
    setPendingImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  // Build prompt history from conversation messages
  const activeMessages = useChatHistoryStore((s) => s.activeMessages)
  const activeConversationId = useChatHistoryStore((s) => s.activeConversationId)

  useEffect(() => {
    const userMessages = activeMessages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
    promptHistoryRef.current = userMessages.filter(
      (msg, i) => i === 0 || msg !== userMessages[i - 1]
    )
    historyIndexRef.current = -1
    draftRef.current = ''
  }, [activeConversationId, activeMessages])

  const handleSubmit = useCallback((): void => {
    const _start = performance.now()
    console.log('[ChatFlow] User Action (Enter/SendButton) → ChatInput.handleSubmit()')
    const trimmed = editorRef.current?.getText()?.trim() ?? ''
    const images = pendingImages.map((img) => img.filename)
    if ((!trimmed && images.length === 0) || isStreaming) return
    console.log('[ChatFlow] ChatInput.handleSubmit() → onSend (ChatMain.handleSend)')
    onSend(trimmed, images.length > 0 ? images : undefined)
    if (trimmed) {
      const history = promptHistoryRef.current
      if (history.length === 0 || history[history.length - 1] !== trimmed) {
        history.push(trimmed)
      }
    }
    historyIndexRef.current = -1
    draftRef.current = ''
    editorRef.current?.clear()
    setPendingImages([])
    const _end = performance.now()
    console.log(`[ChatFlow] ChatInput.handleSubmit() | start: ${_start.toFixed(2)}ms | end: ${_end.toFixed(2)}ms | diff: ${(_end - _start).toFixed(2)}ms`)
  }, [isStreaming, onSend, pendingImages])

  // Handle prompt history navigation via ArrowUp/Down
  useEffect(() => {
    const editorEl = document.querySelector('[data-chat-input]')
    if (!editorEl) return

    const handler = (e: Event): void => {
      const ke = e as KeyboardEvent
      const history = promptHistoryRef.current
      const currentText = editorRef.current?.getText() ?? ''
      const isMultiline = currentText.includes('\n')

      if (ke.key === 'ArrowUp' && history.length > 0 && !isMultiline) {
        ke.preventDefault()
        if (historyIndexRef.current === -1) {
          draftRef.current = currentText
          historyIndexRef.current = history.length - 1
        } else if (historyIndexRef.current > 0) {
          historyIndexRef.current -= 1
        }
        editorRef.current?.setText(history[historyIndexRef.current])
      }

      if (ke.key === 'ArrowDown' && historyIndexRef.current !== -1 && !isMultiline) {
        ke.preventDefault()
        if (historyIndexRef.current < history.length - 1) {
          historyIndexRef.current += 1
          editorRef.current?.setText(history[historyIndexRef.current])
        } else {
          historyIndexRef.current = -1
          editorRef.current?.setText(draftRef.current)
        }
      }
    }

    editorEl.addEventListener('keydown', handler)
    return () => editorEl.removeEventListener('keydown', handler)
  }, [])

  const hasAttachments = onBrowseFiles || onSelectRepo || onPasteText

  const leftSlot = (
    <>
      <AgentModeSelector
        selectedMode={selectedAgentMode}
        onModeChange={onAgentModeChange}
      />
      <div className="w-px h-4 bg-border/40" />
      <ModelSelector
        selectedModelId={selectedModelId}
        onModelChange={onModelChange}
      />
      <div className="w-px h-4 bg-border/40" />
      <PromptPicker
        appId="chat"
        onSelect={(prompt) => {
          const text = stripPromptTemplate(prompt.content)
          if (!text) return
          editorRef.current?.insertText(text)
        }}
      />
      {hasAttachments && (
        <DropdownMenu>
          <Tooltip content="Attach" side="top">
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
              >
                <Paperclip size={15} />
                {sourceCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px] font-bold px-0.5 leading-none">
                    {sourceCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
          </Tooltip>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="z-50 min-w-[180px] rounded-xl border border-border/60 bg-card p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2"
          >
            {onBrowseFiles && (
              <DropdownMenuItem
                onSelect={onBrowseFiles}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer outline-none hover:bg-secondary/60 focus:bg-secondary/60 transition-colors"
              >
                <File size={14} className="text-muted-foreground" />
                Attach Files
              </DropdownMenuItem>
            )}
            {onSelectRepo && (
              <DropdownMenuItem
                onSelect={onSelectRepo}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer outline-none hover:bg-secondary/60 focus:bg-secondary/60 transition-colors"
              >
                <FolderOpen size={14} className="text-muted-foreground" />
                Attach Repository
              </DropdownMenuItem>
            )}
            {onPasteText && (
              <DropdownMenuItem
                onSelect={onPasteText}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer outline-none hover:bg-secondary/60 focus:bg-secondary/60 transition-colors"
              >
                <Type size={14} className="text-muted-foreground" />
                Paste Raw Text
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() => {
                void handleAttachImageClick()
              }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer outline-none hover:bg-secondary/60 focus:bg-secondary/60 transition-colors"
            >
              <ImageIcon size={14} className="text-muted-foreground" />
              Attach Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )

  return (
    <ChatComposerShell
      className="px-4 pb-3 pt-1.5 bg-background"
      leftSlot={leftSlot}
      isStreaming={isStreaming}
      onSubmit={handleSubmit}
      onStop={onStop}
      isSubmitDisabled={editorRef.current?.isEmpty() ?? true}
      onMicTranscript={(text) => {
        editorRef.current?.focus()
        editorRef.current?.insertText(text)
      }}
      onMicCommand={(cmd) => {
        if (cmd === 'send') handleSubmit()
        if (cmd === 'newline') editorRef.current?.insertText('\n')
        if (cmd === 'clear') editorRef.current?.clear()
      }}
    >
      <div style={widthStyle}>
        {pendingImages.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pb-2">
            {pendingImages.map((img) => (
              <div
                key={img.id}
                className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-secondary/40"
                title={img.name}
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePendingImage(img.id)}
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow transition-opacity hover:bg-background group-hover:opacity-100"
                  aria-label={`Remove ${img.name}`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
        <ChatEditor
          ref={editorRef}
          onSubmit={handleSubmit}
          isStreaming={isStreaming}
          onImagePaste={handleImagePaste}
        />
      </div>
    </ChatComposerShell>
  );
}
