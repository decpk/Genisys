const TARGET_SAMPLE_RATE = 16000

/**
 * Downsample audio to 16 kHz mono PCM using linear interpolation.
 * If the input is already 16 kHz mono, the buffer is returned as-is.
 */
export function convertToMono16k(
  inputBuffer: Float32Array,
  inputSampleRate: number
): Float32Array {
  if (inputSampleRate === TARGET_SAMPLE_RATE) {
    return inputBuffer
  }

  const ratio = inputSampleRate / TARGET_SAMPLE_RATE
  const outputLength = Math.floor(inputBuffer.length / ratio)
  const output = new Float32Array(outputLength)

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio
    const srcFloor = Math.floor(srcIndex)
    const srcCeil = Math.min(srcFloor + 1, inputBuffer.length - 1)
    const fraction = srcIndex - srcFloor

    output[i] =
      inputBuffer[srcFloor]! * (1 - fraction) +
      inputBuffer[srcCeil]! * fraction
  }

  return output
}
