/** Encode a string (UTF-8) as base64. Used to transport user input through Tauri IPC safely. */
export function encodeBase64(input: string): string {
  // Browser-safe: TextEncoder → binary string → btoa
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
