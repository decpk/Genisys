import { useCallback, useEffect, useRef, useState } from 'react'
import { scopedToast } from "@/frameworks/notification";

const toast = scopedToast("tts");
import { useSettingsStore } from '@/store/settings-store'
import type { TtsContextValue, TtsStatus, TtsAudioChunkEvent } from '../TextToSpeech.types'
import { extractPlainText } from '../utils/extractPlainText'
import { generateStreamId } from '../utils/generateStreamId'
import { useAudioPlaybackData } from './useAudioPlaybackData'

export function useTextToSpeechData(): TtsContextValue {
  const [status, setStatus] = useState<TtsStatus>('idle')
  const [currentText, setCurrentText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const streamIdRef = useRef<string | null>(null)
  const unlistenChunkRef = useRef<(() => void) | null>(null)
  const unlistenErrorRef = useRef<(() => void) | null>(null)

  const ttsModel = useSettingsStore((s) => s.ttsModel)
  const ttsVoice = useSettingsStore((s) => s.ttsVoice)
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed)

  const handlePlaybackEnd = useCallback(() => {
    setStatus('idle')
    setCurrentText('')
    streamIdRef.current = null
  }, [])

  const { enqueueChunk, stopPlayback, pausePlayback, resumePlayback, markStreamComplete } =
    useAudioPlaybackData(handlePlaybackEnd)

  const cleanup = useCallback(() => {
    unlistenChunkRef.current?.()
    unlistenChunkRef.current = null
    unlistenErrorRef.current?.()
    unlistenErrorRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      cleanup()
      stopPlayback()
    }
  }, [cleanup, stopPlayback])

  const speak = useCallback(
    (text: string) => {
      // Stop any current playback
      if (streamIdRef.current) {
        void window.api.ttsCancel(streamIdRef.current)
        stopPlayback()
        cleanup()
      }

      const plainText = extractPlainText(text)
      if (!plainText) return

      const streamId = generateStreamId()
      streamIdRef.current = streamId
      setStatus('loading')
      setCurrentText(plainText)
      setError(null)

      // Listen for audio chunks
      const unlistenChunk = window.api.onTtsAudioChunk((data: TtsAudioChunkEvent) => {
        if (data.streamId !== streamId) return
        setStatus('speaking')
        enqueueChunk(
          data.audioBase64,
          data.sampleRate,
          data.text,
          data.chunkIndex,
        );
        if (data.isFinal) {
          markStreamComplete()
        }
      })
      unlistenChunkRef.current = unlistenChunk

      // Listen for errors
      const unlistenError = window.api.onTtsError((data: { streamId: string; error: string }) => {
        if (data.streamId !== streamId) return
        setStatus('idle')
        setError(data.error)
        setCurrentText('')
        streamIdRef.current = null
        cleanup()
        toast.error(data.error);
      })
      unlistenErrorRef.current = unlistenError

      // Start synthesis
      void window.api.ttsSynthesize({
        streamId,
        text: plainText,
        voice: ttsVoice,
        speed: ttsSpeed,
        variant: ttsModel,
      }).catch((err: unknown) => {
        setStatus('idle')
        setError(String(err))
        setCurrentText('')
        streamIdRef.current = null
        cleanup()
        toast.error(String(err));
      })
    },
    [ttsModel, ttsVoice, ttsSpeed, enqueueChunk, stopPlayback, cleanup],
  )

  const stop = useCallback(() => {
    if (streamIdRef.current) {
      void window.api.ttsCancel(streamIdRef.current)
    }
    stopPlayback()
    cleanup()
    setStatus('idle')
    setCurrentText('')
    streamIdRef.current = null
  }, [stopPlayback, cleanup])

  const pause = useCallback(() => {
    pausePlayback()
    setStatus('paused')
  }, [pausePlayback])

  const resume = useCallback(() => {
    resumePlayback()
    setStatus('speaking')
  }, [resumePlayback])

  return {
    speak,
    stop,
    pause,
    resume,
    status,
    currentText,
    error,
  }
}
