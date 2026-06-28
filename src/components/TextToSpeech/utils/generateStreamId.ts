export function generateStreamId(): string {
  return `tts-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
