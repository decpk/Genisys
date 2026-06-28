// Decode a base64 string into a Blob and return an object URL for display.
// Callers are responsible for revoking the URL when it is no longer needed.
export function base64ToObjectUrl(base64: string, mimeType: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mimeType || 'application/octet-stream' })
  return URL.createObjectURL(blob)
}
