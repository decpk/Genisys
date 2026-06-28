import type { TransformAction, TransformResult } from './aiTransform.types'
import { fetchAITransform } from './api/fetchAITransform'
import { buildSummarizePrompt } from '@/prompts/clipboardSummarizePrompt'
import { buildFixGrammarPrompt } from '@/prompts/clipboardFixGrammarPrompt'
import { buildTranslatePrompt } from '@/prompts/clipboardTranslatePrompt'
import { buildExplainCodePrompt } from '@/prompts/clipboardExplainCodePrompt'
import { buildToPseudocodePrompt } from '@/prompts/clipboardToPseudocodePrompt'
import { buildFormatConvertPrompt } from '@/prompts/clipboardFormatConvertPrompt'
import { buildToMarkdownTablePrompt } from '@/prompts/clipboardToMarkdownTablePrompt'
import { transformToPlainText } from './transforms/transformToPlainText'
import { transformToUppercase } from './transforms/transformToUppercase'
import { transformToLowercase } from './transforms/transformToLowercase'
import { transformToTitleCase } from './transforms/transformToTitleCase'
import { transformPrettifyJson } from './transforms/transformPrettifyJson'
import { transformMinifyJson } from './transforms/transformMinifyJson'

export async function executeTransform(action: TransformAction, text: string): Promise<TransformResult> {
  try {
    let content: string

    switch (action) {
      // Local transforms (no AI)
      case 'to_plain_text':
        content = transformToPlainText(text)
        break
      case 'to_uppercase':
        content = transformToUppercase(text)
        break
      case 'to_lowercase':
        content = transformToLowercase(text)
        break
      case 'to_title_case':
        content = transformToTitleCase(text)
        break
      case 'prettify_json':
        content = transformPrettifyJson(text)
        break
      case 'minify_json':
        content = transformMinifyJson(text)
        break

      // AI transforms
      case 'summarize': {
        const p = buildSummarizePrompt(text)
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'fix_grammar': {
        const p = buildFixGrammarPrompt(text)
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'explain_code': {
        const p = buildExplainCodePrompt(text)
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'to_pseudocode': {
        const p = buildToPseudocodePrompt(text)
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'translate_english': {
        const p = buildTranslatePrompt(text, 'English')
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'translate_spanish': {
        const p = buildTranslatePrompt(text, 'Spanish')
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'translate_french': {
        const p = buildTranslatePrompt(text, 'French')
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'translate_hindi': {
        const p = buildTranslatePrompt(text, 'Hindi')
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'translate_japanese': {
        const p = buildTranslatePrompt(text, 'Japanese')
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'json_to_yaml': {
        const p = buildFormatConvertPrompt(text, 'JSON', 'YAML')
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'yaml_to_json': {
        const p = buildFormatConvertPrompt(text, 'YAML', 'JSON')
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      case 'to_markdown_table': {
        const p = buildToMarkdownTablePrompt(text)
        content = await fetchAITransform(p.systemPrompt, p.userPrompt)
        break
      }
      default:
        return { success: false, content: '', error: `Unknown transform action: ${action}` }
    }

    return { success: true, content }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transform failed'
    return { success: false, content: '', error: message }
  }
}
