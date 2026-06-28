import { useCallback, useEffect, useRef } from 'react'
import { decodePcmChunk } from '../utils/decodePcmChunk'

interface AudioQueueItem {
  buffer: AudioBuffer
  text: string
  chunkIndex: number
}

interface UseAudioPlaybackReturn {
  enqueueChunk: (
    audioBase64: string,
    sampleRate: number,
    text: string,
    chunkIndex: number,
  ) => void;
  stopPlayback: () => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  markStreamComplete: () => void;
  isPlaying: () => boolean;
  isPaused: () => boolean;
}

export function useAudioPlaybackData(
  onPlaybackEnd: () => void,
): UseAudioPlaybackReturn {
  const audioContextRef = useRef<AudioContext | null>(null)
  const queueRef = useRef<AudioQueueItem[]>([])
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const isPlayingRef = useRef(false)
  const isPausedRef = useRef(false)
  const pauseTimeRef = useRef(0)
  const startTimeRef = useRef(0)
  const currentBufferRef = useRef<AudioBuffer | null>(null)
  const streamCompleteRef = useRef(false)

  // Close the AudioContext when the hook unmounts so the underlying audio
  // graph is released. Browsers cap the number of live AudioContexts, and
  // each one retains audio thread resources until explicitly closed.
  useEffect(() => {
    return () => {
      const ctx = audioContextRef.current
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => {
          /* noop — context may already be closed */
        })
      }
      audioContextRef.current = null
    }
  }, [])

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playNext = useCallback(() => {
    if (isPausedRef.current) return

    const item = queueRef.current.shift()
    if (!item) {
      isPlayingRef.current = false
      if (streamCompleteRef.current) {
        onPlaybackEnd()
      }
      return
    }

    const ctx = getAudioContext()
    const source = ctx.createBufferSource()
    source.buffer = item.buffer
    source.connect(ctx.destination)

    currentSourceRef.current = source
    currentBufferRef.current = item.buffer
    isPlayingRef.current = true
    startTimeRef.current = ctx.currentTime
    pauseTimeRef.current = 0

    source.onended = () => {
      if (currentSourceRef.current === source) {
        currentSourceRef.current = null
        currentBufferRef.current = null
        playNext()
      }
    }

    source.start(0)
  }, [getAudioContext, onPlaybackEnd])

  const enqueueChunk = useCallback(
    (
      audioBase64: string,
      sampleRate: number,
      text: string,
      chunkIndex: number,
    ) => {
      const ctx = getAudioContext();
      const pcmSamples = decodePcmChunk(audioBase64);
      const audioBuffer = ctx.createBuffer(1, pcmSamples.length, sampleRate);
      audioBuffer.getChannelData(0).set(pcmSamples);

      queueRef.current.push({ buffer: audioBuffer, text, chunkIndex });

      if (!isPlayingRef.current && !isPausedRef.current) {
        playNext();
      }
    },
    [getAudioContext, playNext],
  );

  const stopPlayback = useCallback(() => {
    if (currentSourceRef.current) {
      currentSourceRef.current.onended = null
      currentSourceRef.current.stop()
      currentSourceRef.current = null
    }
    currentBufferRef.current = null
    queueRef.current = []
    isPlayingRef.current = false
    isPausedRef.current = false
    pauseTimeRef.current = 0
    streamCompleteRef.current = false
  }, [])

  const pausePlayback = useCallback(() => {
    const ctx = audioContextRef.current
    if (!ctx || !isPlayingRef.current || isPausedRef.current) return

    pauseTimeRef.current = ctx.currentTime - startTimeRef.current
    isPausedRef.current = true

    if (currentSourceRef.current) {
      currentSourceRef.current.onended = null
      currentSourceRef.current.stop()
      currentSourceRef.current = null
    }
  }, [])

  const resumePlayback = useCallback(() => {
    if (!isPausedRef.current || !currentBufferRef.current) return

    const ctx = getAudioContext()
    const source = ctx.createBufferSource()
    source.buffer = currentBufferRef.current
    source.connect(ctx.destination)

    currentSourceRef.current = source
    isPausedRef.current = false
    startTimeRef.current = ctx.currentTime - pauseTimeRef.current

    source.onended = () => {
      if (currentSourceRef.current === source) {
        currentSourceRef.current = null
        currentBufferRef.current = null
        playNext()
      }
    }

    source.start(0, pauseTimeRef.current)
  }, [getAudioContext, playNext])

  const markStreamComplete = useCallback(() => {
    streamCompleteRef.current = true
    if (!isPlayingRef.current && queueRef.current.length === 0 && !isPausedRef.current) {
      onPlaybackEnd()
    }
  }, [onPlaybackEnd])

  const isPlaying = useCallback(() => isPlayingRef.current, [])
  const isPaused = useCallback(() => isPausedRef.current, [])

  return {
    enqueueChunk,
    stopPlayback,
    pausePlayback,
    resumePlayback,
    markStreamComplete,
    isPlaying,
    isPaused,
  }
}
