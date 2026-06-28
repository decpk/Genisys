import { isJson } from './isJson'
import { isHtml } from './isHtml'
import { isCss } from './isCss'
import { isShell } from './isShell'
import { isPython } from './isPython'
import { isSql } from './isSql'
import { isYaml } from './isYaml'
import { isMarkdown } from './isMarkdown'
import { isTypeScript } from './isTypeScript'

export type GuessedLanguage =
  | 'json'
  | 'html'
  | 'css'
  | 'shell'
  | 'python'
  | 'sql'
  | 'yaml'
  | 'markdown'
  | 'typescript'
  | 'javascript'

/**
 * Best-effort language guesser for clipboard text. Caller should first verify
 * the text actually looks like code (via `detectCode`) — this function always
 * returns a string (or null for trivial inputs), defaulting to 'javascript'.
 *
 * Returned strings are guaranteed to be members of Shiki's loaded languages.
 */
export function guessLanguage(text: string): GuessedLanguage | null {
  if (!text || text.length < 3) return null
  if (isJson(text)) return 'json'
  if (isHtml(text)) return 'html'
  if (isCss(text)) return 'css'
  if (isShell(text)) return 'shell'
  if (isSql(text)) return 'sql'
  if (isPython(text)) return 'python'
  if (isYaml(text)) return 'yaml'
  if (isMarkdown(text)) return 'markdown'
  if (isTypeScript(text)) return 'typescript'
  return 'javascript'
}
