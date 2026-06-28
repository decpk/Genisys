import { AI_INLINE_SYSTEM_PROMPT } from '@/prompts/inlineWriterSystemPrompt'

export function buildInlineWriterPrompt(
  instruction: string,
  contextBefore: string,
  contextAfter: string,
): { systemPrompt: string; userPrompt: string } {
  const parts: string[] = []

  if (contextBefore) {
    parts.push(`Text before cursor:\n"""\n${contextBefore}\n"""`)
  }
  if (contextAfter) {
    parts.push(`Text after cursor:\n"""\n${contextAfter}\n"""`)
  }

  parts.push(`Instruction: ${instruction}`)

  return {
    systemPrompt: AI_INLINE_SYSTEM_PROMPT,
    userPrompt: parts.join('\n\n'),
  }
}
