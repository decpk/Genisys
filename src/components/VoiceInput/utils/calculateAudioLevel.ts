/**
 * Calculate the RMS (root mean square) of audio samples.
 * Returns a value between 0.0 and 1.0 suitable for a visual level indicator.
 */
export function calculateAudioLevel(samples: Float32Array): number {
  if (samples.length === 0) return 0

  let sumSquares = 0
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i]!
    sumSquares += sample * sample
  }

  const rms = Math.sqrt(sumSquares / samples.length)
  return Math.min(1, rms)
}
