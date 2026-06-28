import { buildAutocompletePrompt } from '@/prompts/autocompletePrompt'

/**
 * Request an AI text completion for the given context.
 * Uses `window.api.llmJsonCompletion` (non-streaming, single-shot).
 *
 * Returns the suggested completion text, or an empty string on failure.
 * Accepts an AbortSignal so in-flight requests can be cancelled when
 * the user types again before the response arrives.
 */
export async function fetchAICompletion(
  context: string,
  model: string,
  signal?: AbortSignal,
): Promise<string> {
  // Bail immediately if already aborted
  if (signal?.aborted) return ''

  const { systemPrompt, userPrompt } = buildAutocompletePrompt(context)

  try {
    const result = await window.api.llmJsonCompletion({
      systemPrompt,
      userPrompt,
      model,
    })

    // Check abort after the async call resolves
    if (signal?.aborted) return ''

    if (result.success && result.content) {
      // Strip any accidental wrapping quotes the model might add
      return result.content.replace(/^["']|["']$/g, '').trim()
    }

    return ''
  } catch {
    // Network errors, timeouts, etc. — fail silently
    return ''
  }
}
