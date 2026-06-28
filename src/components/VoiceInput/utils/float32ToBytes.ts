/**
 * Converts a Float32Array to a Uint8Array in IEEE 754 little-endian format.
 * Each f32 sample becomes 4 bytes — the format the Rust backend expects.
 */
export function float32ToBytes(samples: Float32Array): Uint8Array {
  const byteLength = samples.length * 4
  const buffer = new ArrayBuffer(byteLength)
  const view = new DataView(buffer)

  for (let i = 0; i < samples.length; i++) {
    view.setFloat32(i * 4, samples[i]!, true) // little-endian
  }

  return new Uint8Array(buffer)
}
