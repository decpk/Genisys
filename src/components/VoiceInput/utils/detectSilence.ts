import { calculateAudioLevel } from './calculateAudioLevel'

const DEFAULT_THRESHOLD = 0.02

/**
 * Returns `true` if the audio chunk is silent (RMS below threshold).
 * Used to skip sending silent chunks to the backend.
 */
export function detectSilence(
  samples: Float32Array,
  threshold: number = DEFAULT_THRESHOLD
): boolean {
  return calculateAudioLevel(samples) < threshold
}
