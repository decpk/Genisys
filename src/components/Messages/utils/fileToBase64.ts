// Read an image File as base64 (data-URL prefix stripped). Enforces a 10MB
// ceiling. Resolves with the payload required by the send-image bridge call.
export function fileToBase64(
  file: File
): Promise<{ base64: string; mimeType: string; fileName: string }> {
  const MAX_BYTES = 10 * 1024 * 1024
  return new Promise((resolve, reject) => {
    if (file.size > MAX_BYTES) {
      reject(new Error('Image is larger than 10MB.'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.onload = () => {
      const result = String(reader.result ?? '')
      const commaIndex = result.indexOf(',')
      const base64 = commaIndex >= 0 ? result.slice(commaIndex + 1) : result
      resolve({
        base64,
        mimeType: file.type || 'image/png',
        fileName: file.name,
      })
    }
    reader.readAsDataURL(file)
  })
}
