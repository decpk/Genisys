import type { TransformAction, TransformConfig } from './aiTransform.types'

export const TRANSFORM_CONFIGS: TransformConfig[] = [
  {
    action: 'summarize',
    label: 'Summarize',
    icon: 'Sparkles',
    description: 'Condense into key points',
    requiresAI: true,
  },
  {
    action: 'fix_grammar',
    label: 'Fix Grammar',
    icon: 'SpellCheck',
    description: 'Fix spelling and grammar',
    requiresAI: true,
  },
  {
    action: 'explain_code',
    label: 'Explain Code',
    icon: 'BookOpen',
    description: 'Plain-English explanation',
    requiresAI: true,
  },
  {
    action: 'to_pseudocode',
    label: 'To Pseudocode',
    icon: 'FileCode',
    description: 'Convert code to pseudocode',
    requiresAI: true,
  },
  {
    action: 'translate_english',
    label: 'To English',
    icon: 'Languages',
    description: 'Translate to English',
    requiresAI: true,
  },
  {
    action: 'translate_spanish',
    label: 'To Spanish',
    icon: 'Languages',
    description: 'Translate to Spanish',
    requiresAI: true,
  },
  {
    action: 'translate_french',
    label: 'To French',
    icon: 'Languages',
    description: 'Translate to French',
    requiresAI: true,
  },
  {
    action: 'translate_hindi',
    label: 'To Hindi',
    icon: 'Languages',
    description: 'Translate to Hindi',
    requiresAI: true,
  },
  {
    action: 'translate_japanese',
    label: 'To Japanese',
    icon: 'Languages',
    description: 'Translate to Japanese',
    requiresAI: true,
  },
  {
    action: 'prettify_json',
    label: 'Prettify JSON',
    icon: 'Braces',
    description: 'Format JSON with indentation',
    requiresAI: false,
  },
  {
    action: 'minify_json',
    label: 'Minify JSON',
    icon: 'Braces',
    description: 'Compact JSON to one line',
    requiresAI: false,
  },
  {
    action: 'json_to_yaml',
    label: 'JSON → YAML',
    icon: 'ArrowRightLeft',
    description: 'Convert JSON to YAML',
    requiresAI: true,
  },
  {
    action: 'yaml_to_json',
    label: 'YAML → JSON',
    icon: 'ArrowRightLeft',
    description: 'Convert YAML to JSON',
    requiresAI: true,
  },
  {
    action: 'to_markdown_table',
    label: 'To Markdown Table',
    icon: 'Table',
    description: 'Convert CSV/data to markdown table',
    requiresAI: true,
  },
  {
    action: 'to_plain_text',
    label: 'Strip Formatting',
    icon: 'RemoveFormatting',
    description: 'Remove all formatting',
    requiresAI: false,
  },
  {
    action: 'to_uppercase',
    label: 'UPPERCASE',
    icon: 'CaseSensitive',
    description: 'Convert to uppercase',
    requiresAI: false,
  },
  {
    action: 'to_lowercase',
    label: 'lowercase',
    icon: 'CaseSensitive',
    description: 'Convert to lowercase',
    requiresAI: false,
  },
  {
    action: 'to_title_case',
    label: 'Title Case',
    icon: 'CaseSensitive',
    description: 'Capitalize first letter of each word',
    requiresAI: false,
  },
]

export function getTransformConfig(action: TransformAction): TransformConfig | undefined {
  return TRANSFORM_CONFIGS.find((c) => c.action === action)
}
