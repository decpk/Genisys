import type { TransformGroup } from './TransformMenu.types'

export const TRANSFORM_GROUPS: TransformGroup[] = [
  {
    label: 'AI',
    actions: ['summarize', 'fix_grammar', 'explain_code', 'to_pseudocode'],
  },
  {
    label: 'Translate',
    actions: ['translate_english', 'translate_spanish', 'translate_french', 'translate_hindi', 'translate_japanese'],
  },
  {
    label: 'Convert',
    actions: ['prettify_json', 'minify_json', 'json_to_yaml', 'yaml_to_json', 'to_markdown_table'],
  },
  {
    label: 'Format',
    actions: ['to_plain_text', 'to_uppercase', 'to_lowercase', 'to_title_case'],
  },
]
