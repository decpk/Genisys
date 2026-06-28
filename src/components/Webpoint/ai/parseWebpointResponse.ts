import type { ParsedWebpointResponse, WebpointAIAction } from './types'

const ACTIONS: WebpointAIAction[] = ['replace_deck', 'update_slide', 'add_slides']

/** Pull a JSON payload out of the agent's streamed text (fenced block preferred,
 *  otherwise the outermost `{ ... }`). */
function extractJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced && fenced[1]) return fenced[1].trim()
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first !== -1 && last > first) return text.slice(first, last + 1)
  return null
}

/** Parse and shallow-validate the agent's response into an applicable deck op. */
export function parseWebpointResponse(text: string): ParsedWebpointResponse | null {
  const json = extractJson(text)
  if (!json) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Record<string, unknown>
  if (typeof obj.action !== 'string' || !ACTIONS.includes(obj.action as WebpointAIAction)) {
    return null
  }
  return obj as unknown as ParsedWebpointResponse
}
