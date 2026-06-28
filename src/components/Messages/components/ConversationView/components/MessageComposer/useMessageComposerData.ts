import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { sendControl } from '@/components/Messages/api/sendControl'
import { sendImage } from '@/components/Messages/api/sendImage'
import { sendText } from '@/components/Messages/api/sendText'
import { setTypingState } from '@/components/Messages/api/setTypingState'
import { base64ToObjectUrl } from '@/components/Messages/utils/base64ToObjectUrl'
import { envelopeToMessage } from '@/components/Messages/utils/envelopeToMessage'
import { fileToBase64 } from '@/components/Messages/utils/fileToBase64'
import { useMessagesStore } from '@/store/messages-store'

import { EPHEMERAL_TTL_OPTIONS } from '../ConversationHeader/components/EphemeralTimerPicker/EphemeralTimerPicker.constants'
import type { MessageComposerData } from './MessageComposer.types'

const TYPING_IDLE_MS = 1500
const MAX_TEXTAREA_HEIGHT = 160
// Default TTL applied when disappearing messages are toggled on from the
// composer (matches the "5 minutes" option in the header picker).
const DEFAULT_EPHEMERAL_TTL_MS = 5 * 60_000

export function useMessageComposerData(
  peerId: string,
  isConnected: boolean
): MessageComposerData {
  const appendMessage = useMessagesStore((s) => s.appendMessage)
  const setEphemeralTtl = useMessagesStore((s) => s.setEphemeralTtl)
  const activeTtl = useMessagesStore((s) => s.ephemeralTtlByPeer[peerId] ?? 0)

  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimer = useRef<number | null>(null)

  const clearTypingTimer = useCallback(() => {
    if (typingTimer.current !== null) {
      window.clearTimeout(typingTimer.current)
      typingTimer.current = null
    }
  }, [])

  const emitTyping = useCallback(() => {
    void setTypingState(peerId, true).catch(() => undefined)
    clearTypingTimer()
    typingTimer.current = window.setTimeout(() => {
      void setTypingState(peerId, false).catch(() => undefined)
      typingTimer.current = null
    }, TYPING_IDLE_MS)
  }, [peerId, clearTypingTimer])

  const resetHeight = useCallback(() => {
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const el = event.target
      setText(el.value)
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
      if (el.value.trim()) emitTyping()
    },
    [emitTyping]
  )

  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return
    if (!isConnected) {
      toast.error('Not connected to this peer — reconnect to send messages.')
      return
    }
    setIsSending(true)
    clearTypingTimer()
    void setTypingState(peerId, false).catch(() => undefined)
    try {
      const envelope = await sendText(peerId, trimmed)
      appendMessage(peerId, envelopeToMessage(envelope))
      setText('')
      resetHeight()
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.error('[messages] failed to send message:', e)
      toast.error(`Couldn't send message: ${message}`)
    } finally {
      setIsSending(false)
    }
  }, [text, isSending, isConnected, peerId, appendMessage, clearTypingTimer, resetHeight])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void handleSend()
      }
    },
    [handleSend]
  )

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onToggleEphemeral = useCallback(() => {
    const next = activeTtl > 0 ? 0 : DEFAULT_EPHEMERAL_TTL_MS
    setEphemeralTtl(peerId, next)
    void sendControl(peerId, { t: 'ephemeral-timer', ttlMs: next }).catch(
      () => undefined
    )
    toast.info(
      next > 0
        ? 'Disappearing messages on · 5 minutes'
        : 'Disappearing messages off'
    )
  }, [activeTtl, peerId, setEphemeralTtl])

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      if (!isConnected) {
        toast.error('Not connected to this peer — reconnect to send images.')
        return
      }
      setIsSending(true)
      try {
        const { base64, mimeType, fileName } = await fileToBase64(file)
        const envelope = await sendImage({
          peerId,
          dataBase64: base64,
          mimeType,
          fileName,
        })
        // Build the local echo from the data we already read so the preview
        // never depends on the round-tripped payload rendering correctly.
        appendMessage(peerId, {
          ...envelope,
          imageBase64: base64,
          mimeType,
          imageObjectUrl: base64ToObjectUrl(base64, mimeType),
        })
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        console.error('[messages] failed to send image:', e)
        toast.error(`Couldn't send image: ${message}`)
      } finally {
        setIsSending(false)
      }
    },
    [peerId, isConnected, appendMessage]
  )

  useEffect(() => {
    setText('')
    clearTypingTimer()
    return () => clearTypingTimer()
  }, [peerId, clearTypingTimer])

  const insertEmoji = useCallback(
    (emoji: string) => {
      const el = textareaRef.current
      if (!el) {
        setText((prev) => prev + emoji)
        return
      }
      const start = el.selectionStart ?? el.value.length
      const end = el.selectionEnd ?? el.value.length
      setText((prev) => prev.slice(0, start) + emoji + prev.slice(end))
      requestAnimationFrame(() => {
        const caret = start + emoji.length
        el.focus()
        el.setSelectionRange(caret, caret)
      })
    },
    []
  )

  let placeholder = 'Disconnected — reconnect to send messages'
  if (isConnected && activeTtl > 0) {
    const label = EPHEMERAL_TTL_OPTIONS.find((o) => o.ms === activeTtl)?.label
    placeholder = label
      ? `Disappearing message · vanishes after ${label}`
      : 'Disappearing message · encrypted & ephemeral'
  } else if (isConnected) {
    placeholder = 'Message — encrypted end-to-end'
  }

  return {
    text,
    isSending,
    canSend: text.trim().length > 0 && !isSending && isConnected,
    placeholder,
    ephemeralActive: activeTtl > 0,
    textareaRef,
    fileInputRef,
    handleChange,
    handleKeyDown,
    handleSend,
    handleAttachClick,
    handleFileChange,
    onToggleEphemeral,
    insertEmoji,
  }
}
