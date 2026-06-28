import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  PermissionState,
  VoiceCommand,
  WhisperChunkEvent,
} from '../VoiceInput.types'
import { useAudioCaptureData } from './useAudioCaptureData'
import { detectSilence } from '../utils/detectSilence'
import { float32ToBytes } from '../utils/float32ToBytes'
import { parseVoiceCommand } from '../utils/parseVoiceCommand'
import { isHallucination } from '../utils/isHallucination'

interface VoiceInputOptions {
  onTranscript?: (text: string) => void
  onCommand?: (command: VoiceCommand) => void
  commandsEnabled?: boolean
  continuousDictation?: boolean
}

interface VoiceInputResult {
  startVoiceInput: () => Promise<void>
  stopVoiceInput: () => void
  isListening: boolean
  transcript: string
  interimText: string
  audioLevel: number
  error: string | null
  permissionState: PermissionState
}

function generateStreamId(): string {
  return `voice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useVoiceInputData(options: VoiceInputOptions): VoiceInputResult {
  const {
    onTranscript,
    onCommand,
    commandsEnabled = false,
    continuousDictation = false,
  } = options

  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')

  const streamIdRef = useRef<string | null>(null)
  const transcriptRef = useRef('')
  const unlistenRef = useRef<(() => void) | null>(null)

  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript
  const onCommandRef = useRef(onCommand)
  onCommandRef.current = onCommand
  const commandsEnabledRef = useRef(commandsEnabled)
  commandsEnabledRef.current = commandsEnabled

  const handleChunk = useCallback(
    (chunk: Float32Array) => {
      if (!continuousDictation && detectSilence(chunk)) return

      const bytes = float32ToBytes(chunk)
      const streamId = streamIdRef.current
      if (!streamId) return

      const api = (window as any).api
      if (!api?.whisperTranscribeChunk) return

      void api.whisperTranscribeChunk({
        streamId,
        audioData: Array.from(bytes),
        language: null,
      })
    },
    [continuousDictation]
  )

  const {
    startRecording,
    stopRecording,
    isRecording,
    audioLevel,
    error: captureError,
    permissionState,
  } = useAudioCaptureData(handleChunk)

  const cleanupListeners = useCallback(() => {
    if (unlistenRef.current) {
      unlistenRef.current()
      unlistenRef.current = null
    }
  }, [])

  const stopVoiceInput = useCallback(() => {
    stopRecording()

    const api = (window as any).api
    if (streamIdRef.current && api?.whisperCancel) {
      void api.whisperCancel(streamIdRef.current)
    }

    cleanupListeners()
    streamIdRef.current = null
  }, [stopRecording, cleanupListeners])

  const startVoiceInput = useCallback(async () => {
    console.log('[VoiceInput] Starting voice input...')
    streamIdRef.current = generateStreamId()
    transcriptRef.current = ''
    setTranscript('')
    setInterimText('')

    const api = (window as any).api
    if (api?.onWhisperChunk) {
      const unlisten = await api.onWhisperChunk(
        (event: WhisperChunkEvent) => {
          if (event.streamId !== streamIdRef.current) return

          if (event.isFinal) {
            const newText = event.text.trim()
            if (!newText || isHallucination(newText)) return

            if (commandsEnabledRef.current) {
              const result = parseVoiceCommand(newText)

              if (result.isCommand && result.command) {
                if (result.remainingText) {
                  transcriptRef.current += ' ' + result.remainingText
                  setTranscript(transcriptRef.current.trim())
                  onTranscriptRef.current?.(result.remainingText)
                }
                onCommandRef.current?.(result.command)

                if (result.command === 'stop') {
                  stopVoiceInput()
                }
                return
              }
            }

            transcriptRef.current += ' ' + newText
            setTranscript(transcriptRef.current.trim())
            setInterimText('')
            onTranscriptRef.current?.(newText)
          } else {
            setInterimText(event.text)
          }
        }
      )
      unlistenRef.current =
        typeof unlisten === 'function' ? unlisten : null
    }

    await startRecording()
  }, [startRecording, stopVoiceInput])

  useEffect(() => {
    return () => {
      cleanupListeners()
    }
  }, [cleanupListeners])

  return {
    startVoiceInput,
    stopVoiceInput,
    isListening: isRecording,
    transcript,
    interimText,
    audioLevel,
    error: captureError,
    permissionState,
  }
}
