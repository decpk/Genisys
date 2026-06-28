/** Decode a base64 string to a Uint8Array of raw bytes (PTY output is binary-safe). */
export function decodeBase64(input: string): Uint8Array {
  const binary = atob(input)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
