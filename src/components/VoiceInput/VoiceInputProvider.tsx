import { useCallback, useEffect, useRef, useState } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('voice')
import type { VoiceCommand, VoiceInputContextValue } from './VoiceInput.types'
import { VoiceInputContext } from './VoiceInputContext'
import { VoiceIndicator } from './VoiceIndicator'
import { useVoiceInputData } from './hooks/useVoiceInputData'

function VoiceInputProvider(props: { children: React.ReactNode }) {
  const { children } = props

  const onTranscriptRef = useRef<((text: string) => void) | null>(null)
  const onCommandRef = useRef<((cmd: VoiceCommand) => void) | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const pendingStartRef = useRef<{ onTranscript: (text: string) => void; onCommand?: (cmd: VoiceCommand) => void } | null>(null)
  // Refs for whisper-model download listeners so they can be cleaned up if
  // the provider unmounts or `stopVoiceInput` is called mid-download.
  // Previously the unlistens were locals that only ran on the success path,
  // leaking handlers whenever the user navigated away during download.
  const unlistenProgressRef = useRef<(() => void) | null>(null)
  const unlistenDoneRef = useRef<(() => void) | null>(null)

  const handleTranscript = useCallback((text: string) => {
    onTranscriptRef.current?.(text)
  }, [])

  const handleCommand = useCallback((cmd: VoiceCommand) => {
    onCommandRef.current?.(cmd)
  }, [])

  const {
    startVoiceInput: startInput,
    stopVoiceInput: stopInput,
    isListening,
    transcript,
    interimText,
    audioLevel,
    error,
    permissionState,
  } = useVoiceInputData({
    onTranscript: handleTranscript,
    onCommand: handleCommand,
    commandsEnabled: true,
    continuousDictation: true,
  })

  const checkModelAndStart = useCallback(
    async (onTranscript: (text: string) => void, onCommand?: (cmd: VoiceCommand) => void) => {
      const api = (window as any).api
      if (!api?.whisperListModels) {
        toast.error('Voice input is not available')
        return
      }

      try {
        const result = await api.whisperListModels()
        const models = result?.models ?? []
        const hasAnyDownloaded = models.some((m: any) => m.downloaded)

        if (hasAnyDownloaded) {
          onTranscriptRef.current = onTranscript
          onCommandRef.current = onCommand ?? null
          await startInput()
          return
        }

        // No model downloaded — auto-download base model
        pendingStartRef.current = { onTranscript, onCommand }
        setIsDownloading(true)
        toast.info('Downloading voice model (base, ~150MB)...', { duration: Infinity, id: 'voice-model-download' })

        const unlistenProgress = api.onWhisperModelDownloadProgress?.((data: any) => {
          toast.info(`Downloading voice model... ${data.percent}%`, { duration: Infinity, id: 'voice-model-download' })
        })
        unlistenProgressRef.current = unlistenProgress ?? null

        const unlistenDone = api.onWhisperModelDownloadDone?.((data: any) => {
          toast.success('Voice model downloaded! Starting voice input...', { id: 'voice-model-download' })
          setIsDownloading(false)
          unlistenProgressRef.current?.()
          unlistenDoneRef.current?.()
          unlistenProgressRef.current = null
          unlistenDoneRef.current = null

          // Auto-start after download
          const pending = pendingStartRef.current
          if (pending) {
            pendingStartRef.current = null
            onTranscriptRef.current = pending.onTranscript
            onCommandRef.current = pending.onCommand ?? null
            void startInput()
          }
        })
        unlistenDoneRef.current = unlistenDone ?? null

        await api.whisperDownloadModel('base')
      } catch (err) {
        setIsDownloading(false)
        toast.dismiss('voice-model-download')
        const msg = err instanceof Error ? err.message : String(err)
        toast.error(`Failed to prepare voice input: ${msg}`)
      }
    },
    [startInput],
  )

  const startVoiceInput = useCallback(
    async (onTranscript: (text: string) => void, onCommand?: (cmd: VoiceCommand) => void) => {
      if (isListening || isDownloading) return
      await checkModelAndStart(onTranscript, onCommand)
    },
    [isListening, isDownloading, checkModelAndStart],
  )

  const stopVoiceInput = useCallback(() => {
    stopInput()
    onTranscriptRef.current = null
    onCommandRef.current = null
    pendingStartRef.current = null
    // Cancel any in-flight download listeners so they don't dangle.
    unlistenProgressRef.current?.()
    unlistenDoneRef.current?.()
    unlistenProgressRef.current = null
    unlistenDoneRef.current = null
  }, [stopInput])

  // Final safety net: if the provider unmounts mid-download, clean up the
  // whisper listeners so they don't leak beyond the component lifetime.
  useEffect(() => {
    return () => {
      unlistenProgressRef.current?.()
      unlistenDoneRef.current?.()
      unlistenProgressRef.current = null
      unlistenDoneRef.current = null
    }
  }, [])

  // Show toast when error occurs
  useEffect(() => {
    if (!error) return
    // Don't show "model not downloaded" as error — we handle it via auto-download
    if (error.includes('not downloaded')) return
    toast.error(error)
  }, [error])

  const contextValue: VoiceInputContextValue = {
    startVoiceInput,
    stopVoiceInput,
    isListening,
    audioLevel,
    transcript,
    interimText,
    error,
    permissionState,
  }

  return (
    <VoiceInputContext.Provider value={contextValue}>
      {children}
      <VoiceIndicator
        isListening={isListening}
        interimText={interimText}
        audioLevel={audioLevel}
        onStop={stopVoiceInput}
      />
    </VoiceInputContext.Provider>
  )
}

export { VoiceInputProvider }
