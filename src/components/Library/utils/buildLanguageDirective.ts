import { getLanguageLabel } from '@/lib/getLanguageLabel'
import type { Language } from '@/lib/languages'

/**
 * Returns a directive block to inject at the top of a book/article system
 * prompt, instructing the model to produce content in a non-English language.
 * Returns empty string for English (no-op, preserves byte-identical English path).
 */
export function buildLanguageDirective(language: Language | undefined): string {
  if (!language || language === 'english') return ''
  const label = getLanguageLabel(language)

  // Hinglish has a very specific meaning: code-switched Hindi+English written
  // in the Devanagari script for Hindi words and Latin script for English
  // loanwords / technical terms. NEVER produce romanized Hindi
  // (i.e. Hindi words written in Latin letters like "kahani", "shuru").
  if (language === 'hinglish') {
    return `\n────────────────────────────────────────────────────────────
LANGUAGE DIRECTIVE — HINGLISH (STRICT)
────────────────────────────────────────────────────────────

All natural-language content (chapter titles, prose, headings, bullets,
callout text, quiz questions and options, summaries) MUST be written in
HINGLISH using BOTH scripts mixed naturally in the SAME sentence:

  • Hindi words → Devanagari script (देवनागरी). Examples: कहानी, शुरू,
    दिखाया, साबित, लड़ाई.
  • English technical/loan words → Latin script as-is. Examples: RADAR,
    engineers, physicists, electromagnetic theory, network.
  • Numbers and dates → Latin/Arabic numerals (1886, 1930s).

DO NOT romanize Hindi words into Latin letters
(e.g. "kahani", "shuru hoti hai", "ne demonstrate kiya"). That is WRONG.
The correct style is: "RADAR की कहानी engineers से नहीं, बल्कि physicists
से शुरू होती है। 1886 में, Heinrich Hertz ने demonstrate किया कि radio
waves solid objects से reflect हो सकती हैं।"

Keep these in English (do not translate or transliterate):
- Block tags and their attribute names: <lib-chapter>, <lib-toc>, <lib-book>, <lib-callout>, <lib-quiz>, <lib-question>, <lib-option>, <lib-answer>, <lib-explanation>, <lib-challenge>, <lib-task>, <lib-summary>, and attributes (number, title, status, variant, tier, type, correct)
- Code blocks: code, identifiers, comments inside code, language tags
- Mermaid diagram syntax (translate node labels only, using the same Hinglish style)
- HTML/Markdown comment syntax (e.g., <!-- ~X words -->)
- Translate only the visible text inside block tags, never the tags themselves
\n`
  }

  return `\n────────────────────────────────────────────────────────────
LANGUAGE DIRECTIVE — STRICT
────────────────────────────────────────────────────────────

All natural-language content (chapter titles, prose, headings, bullets,
callout text, quiz questions and options, summaries) MUST be written in
${label}.

Keep these in English (do not translate):
- Block tags and their attribute names: <lib-chapter>, <lib-toc>, <lib-book>, <lib-callout>, <lib-quiz>, <lib-question>, <lib-option>, <lib-answer>, <lib-explanation>, <lib-challenge>, <lib-task>, <lib-summary>, and attributes (number, title, status, variant, tier, type, correct)
- Code blocks: code, identifiers, comments inside code, language tags
- Mermaid diagram syntax (translate node labels only)
- HTML/Markdown comment syntax (e.g., <!-- ~X words -->)
- Translate only the visible text inside block tags, never the tags themselves

If the user's topic is in English, still produce all output in ${label}.
\n`
}
