export type TtsStatus = 'idle' | 'loading' | 'speaking' | 'paused'

export interface TtsVoice {
  id: string
  label: string
}

export interface TtsAudioChunkEvent {
  streamId: string;
  audioBase64: string;
  sampleRate: number;
  chunkIndex: number;
  totalChunks: number;
  text: string;
  isFinal: boolean;
}

export interface TtsModelInfo {
  variant: string
  size: number
  path: string
  downloaded: boolean
}

export interface TtsContextValue {
  speak: (text: string) => void
  stop: () => void
  pause: () => void
  resume: () => void
  status: TtsStatus
  currentText: string
  error: string | null
}

export interface SpeakerButtonProps {
  text: string
  size?: number
  className?: string
  disabled?: boolean
}
