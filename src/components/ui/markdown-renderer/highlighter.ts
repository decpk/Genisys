import { createHighlighter, type Highlighter } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const SUPPORTED_LANGS = [
  'javascript', 'typescript', 'jsx', 'tsx', 'python', 'rust', 'go',
  'java', 'c', 'cpp', 'csharp', 'html', 'css', 'json', 'yaml', 'toml',
  'markdown', 'bash', 'shell', 'sql', 'ruby', 'php', 'swift', 'kotlin',
  'dart', 'lua', 'r', 'scala', 'haskell', 'elixir', 'zig',
] as const

let highlighterPromise: Promise<Highlighter> | null = null

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['one-dark-pro', 'github-light'],
      langs: [...SUPPORTED_LANGS],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}
