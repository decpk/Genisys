import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Languages,
  Lightbulb,
  ListChecks,
  PenLine,
  Search,
  Sparkles,
  Wand2,
} from 'lucide-react'

/**
 * Pick a contextual lucide icon based on suggestion text keywords.
 * Falls back to `Sparkles` when nothing matches.
 */
export function pickSuggestionIcon(text: string): LucideIcon {
  const t = text.toLowerCase()
  if (/summar|tl;dr|recap|brief/.test(t)) return FileText
  if (/explain|simpl|what is|how does|why/.test(t)) return Lightbulb
  if (/find|search|look up|related|discover/.test(t)) return Search
  if (/write|draft|compose|generate|create/.test(t)) return PenLine
  if (/translate|language/.test(t)) return Languages
  if (/list|step|todo|checklist|plan/.test(t)) return ListChecks
  if (/improve|rewrite|polish|fix|refine/.test(t)) return Wand2
  return Sparkles
}
