import { useState, useCallback, useRef, useEffect } from 'react'
import { extractSurroundingContext } from '../utils/extractSurroundingContext'
import { replaceWithParsedMarkdown } from '../utils/replaceWithParsedMarkdown'
import { streamInlineWrite } from '../api/streamInlineWrite'
import { resolveAppModel } from '@/lib/resolveAppModel'
import type { AIInlinePromptProps } from './AIInlinePrompt.types'

type PromptStatus = 'idle' | 'streaming' | 'done' | 'error'

export function useAIInlinePromptData(props: AIInlinePromptProps) {
  const { editor, cursorPos, onClose } = props

  const [input, setInput] = useState('')
  const [status, setStatus] = useState<PromptStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [tokenCount, setTokenCount] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<(() => void) | null>(null)
  const insertPosRef = useRef(cursorPos)
  const startPosRef = useRef(cursorPos)
  const contentBufferRef = useRef('')

  // Auto-focus the input on mount
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRef.current?.()
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || status === 'streaming') return

    setStatus('streaming')
    setErrorMsg('')
    setTokenCount(0)
    contentBufferRef.current = ''

    const { before, after } = extractSurroundingContext(editor.state.doc, cursorPos, 600)
    insertPosRef.current = cursorPos
    startPosRef.current = cursorPos

    cancelRef.current = streamInlineWrite({
      instruction: trimmed,
      contextBefore: before,
      contextAfter: after,
      model: resolveAppModel('chat'),
      onToken: (token) => {
        // Insert plain text for real-time streaming feedback
        const tr = editor.state.tr.insertText(token, insertPosRef.current)
        editor.view.dispatch(tr)
        insertPosRef.current += token.length
        contentBufferRef.current += token
        setTokenCount((c) => c + 1)
      },
      onDone: () => {
        cancelRef.current = null
        // Replace the streamed plain text with properly parsed markdown
        const startPos = startPosRef.current
        const endPos = insertPosRef.current
        const fullContent = contentBufferRef.current
        if (fullContent) {
          replaceWithParsedMarkdown(editor, startPos, endPos, fullContent)
        }
        setStatus('done')
      },
      onError: (error) => {
        cancelRef.current = null
        setStatus('error')
        setErrorMsg(error)
      },
    })
  }, [input, status, editor, cursorPos])

  const handleStop = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = null
    setStatus('done')
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        if (status === 'streaming') {
          handleStop()
        }
        onClose()
      }
    },
    [handleSubmit, handleStop, onClose, status],
  )

  return {
    input,
    setInput,
    status,
    errorMsg,
    tokenCount,
    inputRef,
    handleKeyDown,
    handleSubmit,
    handleStop,
  }
}
