/**
 * Best-effort extraction of a JSON object/array from an LLM response.
 *
 * Handles:
 *   - Raw JSON
 *   - ```json ... ``` or ``` ... ``` markdown fences
 *   - Leading/trailing prose around a JSON block
 *
 * Returns the parsed value, or throws a descriptive error.
 */
export function extractJsonFromLlmResponse<T = unknown>(raw: string): T {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new Error('AI response was empty')
  }

  const cleaned = raw.trim()

  // 1) Try direct parse first (the happy path).
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // fall through to extraction attempts
  }

  // 2) Strip markdown code fences (```json ... ``` or ``` ... ```).
  const fenceMatch = cleaned.match(/```(?:json|JSON)?\s*([\s\S]*?)```/)
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T
    } catch {
      // continue
    }
  }

  // 3) Substring from first `{` / `[` to the matching last `}` / `]`.
  const firstObj = cleaned.indexOf('{')
  const lastObj = cleaned.lastIndexOf('}')
  if (firstObj !== -1 && lastObj > firstObj) {
    const slice = cleaned.slice(firstObj, lastObj + 1)
    try {
      return JSON.parse(slice) as T
    } catch {
      // continue
    }
  }

  const firstArr = cleaned.indexOf('[')
  const lastArr = cleaned.lastIndexOf(']')
  if (firstArr !== -1 && lastArr > firstArr) {
    const slice = cleaned.slice(firstArr, lastArr + 1)
    try {
      return JSON.parse(slice) as T
    } catch {
      // continue
    }
  }

  throw new Error('AI response was not valid JSON')
}
