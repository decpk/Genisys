import { Lightbulb, Zap, Flame, Puzzle, Sparkles, Info } from 'lucide-react'
import type { ElementType } from 'react'

export interface CalloutVariantConfig {
  icon: ElementType
  label: string
  bg: string
  border: string
  iconColor: string
  labelColor: string
}

/**
 * Known callout variants. The `variant` attribute is an OPEN vocabulary — any
 * unknown value falls back to {@link CALLOUT_DEFAULT} with a title-cased label,
 * so adding a new callout type can never break rendering.
 */
export const CALLOUT_VARIANTS: Record<string, CalloutVariantConfig> = {
  'did-you-know': {
    icon: Lightbulb,
    label: 'Did You Know?',
    bg: 'bg-amber-500/[0.05]',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-500',
    labelColor: 'text-amber-600 dark:text-amber-400',
  },
  'try-this': {
    icon: Zap,
    label: 'Try This Now',
    bg: 'bg-blue-500/[0.05]',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-500',
    labelColor: 'text-blue-600 dark:text-blue-400',
  },
  'war-story': {
    icon: Flame,
    label: 'War Story',
    bg: 'bg-red-500/[0.05]',
    border: 'border-red-500/20',
    iconColor: 'text-red-500',
    labelColor: 'text-red-600 dark:text-red-400',
  },
  analogy: {
    icon: Puzzle,
    label: 'Analogy',
    bg: 'bg-violet-500/[0.05]',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-500',
    labelColor: 'text-violet-600 dark:text-violet-400',
  },
  hint: {
    icon: Sparkles,
    label: 'Hint',
    bg: 'bg-emerald-500/[0.05]',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-500',
    labelColor: 'text-emerald-600 dark:text-emerald-400',
  },
}

export const CALLOUT_DEFAULT: CalloutVariantConfig = {
  icon: Info,
  label: 'Note',
  bg: 'bg-primary/[0.04]',
  border: 'border-primary/15',
  iconColor: 'text-primary',
  labelColor: 'text-primary',
}

function toTitleCase(value: string): string {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Resolve a callout `variant` to its style config, with a graceful default. */
export function resolveCalloutVariant(variant: string | undefined): CalloutVariantConfig {
  if (!variant) return CALLOUT_DEFAULT
  const known = CALLOUT_VARIANTS[variant]
  if (known) return known
  return { ...CALLOUT_DEFAULT, label: toTitleCase(variant) }
}
