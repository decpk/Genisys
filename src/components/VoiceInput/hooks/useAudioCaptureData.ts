import { useCallback, useEffect, useRef, useState } from 'react'
import type { PermissionState } from '../VoiceInput.types'
import { calculateAudioLevel } from '../utils/calculateAudioLevel'
import { convertToMono16k } from '../utils/convertToMono16k'

const BUFFER_SIZE = 4096
const TARGET_SAMPLE_RATE = 16000
const CHUNK_SAMPLES = 32000 // ~2 seconds at 16kHz

interface AudioCaptureResult {
  startRecording: () => Promise<void>
  stopRecording: () => void
  isRecording: boolean
  audioLevel: number
  error: string | null
  permissionState: PermissionState
}

export function useAudioCaptureData(
  onChunk: (chunk: Float32Array) => void
): AudioCaptureResult {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] =
    useState<PermissionState>('unknown')

  const onChunkRef = useRef(onChunk)
  onChunkRef.current = onChunk

  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const accumulatorRef = useRef<Float32Array>(new Float32Array(0))

  const cleanup = useCallback(() => {
    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()
    processorRef.current = null
    sourceRef.current = null

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }

    if (audioContextRef.current?.state !== 'closed') {
      void audioContextRef.current?.close()
    }
    audioContextRef.current = null

    accumulatorRef.current = new Float32Array(0)
    setAudioLevel(0)
  }, [])

  const stopRecording = useCallback(() => {
    cleanup()
    setIsRecording(false)
  }, [cleanup])

  const startRecording = useCallback(async () => {
    setError(null)

    try {
      console.log('[VoiceInput] Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: TARGET_SAMPLE_RATE },
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      console.log('[VoiceInput] Microphone access granted')

      setPermissionState('granted')
      streamRef.current = stream

      const audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      sourceRef.current = source

      const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1)
      processorRef.current = processor

      const actualSampleRate = audioContext.sampleRate

      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        const inputData = event.inputBuffer.getChannelData(0)

        const mono16k =
          actualSampleRate !== TARGET_SAMPLE_RATE
            ? convertToMono16k(inputData, actualSampleRate)
            : new Float32Array(inputData)

        setAudioLevel(calculateAudioLevel(mono16k))

        const prev = accumulatorRef.current
        const merged = new Float32Array(prev.length + mono16k.length)
        merged.set(prev)
        merged.set(mono16k, prev.length)
        accumulatorRef.current = merged

        if (accumulatorRef.current.length >= CHUNK_SAMPLES) {
          const chunk = accumulatorRef.current.slice(0, CHUNK_SAMPLES)
          accumulatorRef.current = accumulatorRef.current.slice(CHUNK_SAMPLES)
          onChunkRef.current(chunk)
        }
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      console.log('[VoiceInput] Recording started, sampleRate:', actualSampleRate)
      setIsRecording(true)
    } catch (err) {
      console.error('[VoiceInput] Audio capture error:', err)
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access denied. Grant permission in System Settings > Privacy & Security > Microphone.'
          : err instanceof DOMException && err.name === 'NotFoundError'
            ? 'No microphone found'
            : `Failed to start audio capture: ${err instanceof Error ? err.message : String(err)}`

      if (
        err instanceof DOMException &&
        err.name === 'NotAllowedError'
      ) {
        setPermissionState('denied')
      }

      setError(message)
      cleanup()
    }
  }, [cleanup])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    startRecording,
    stopRecording,
    isRecording,
    audioLevel,
    error,
    permissionState,
  }
}
