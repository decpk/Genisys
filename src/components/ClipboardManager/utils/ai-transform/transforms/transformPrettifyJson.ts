export function transformPrettifyJson(text: string): string {
  const parsed = JSON.parse(text.trim())
  return JSON.stringify(parsed, null, 2)
}
