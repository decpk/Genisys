export function transformMinifyJson(text: string): string {
  const parsed = JSON.parse(text.trim())
  return JSON.stringify(parsed)
}
