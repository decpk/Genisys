export type TransformAction =
  | 'summarize'
  | 'fix_grammar'
  | 'translate_english'
  | 'translate_spanish'
  | 'translate_french'
  | 'translate_hindi'
  | 'translate_japanese'
  | 'explain_code'
  | 'to_pseudocode'
  | 'json_to_yaml'
  | 'yaml_to_json'
  | 'prettify_json'
  | 'minify_json'
  | 'to_plain_text'
  | 'to_markdown_table'
  | 'to_uppercase'
  | 'to_lowercase'
  | 'to_title_case'

export interface TransformConfig {
  action: TransformAction
  label: string
  icon: string
  description: string
  requiresAI: boolean
}

export interface TransformResult {
  success: boolean
  content: string
  error?: string
}
