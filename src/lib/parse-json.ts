export function parseJSON<T = unknown>(text: string): T {
  try {
    return JSON.parse(text.trim())
  } catch {
    // Try extracting from markdown code fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) {
      return JSON.parse(fenceMatch[1].trim())
    }
    // Try extracting a JSON array from mixed content
    const arrayMatch = text.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0].trim())
    }
    // Try extracting a JSON object from mixed content
    const objectMatch = text.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0].trim())
    }
    throw new Error('Failed to parse JSON from response')
  }
}
