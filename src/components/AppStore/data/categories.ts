import { Code2, Cpu, Rocket, Sparkles } from 'lucide-react'

import type { AppCategory, AppCategoryId } from '../AppStore.types'

/**
 * Ordered list of categories displayed in the App Store sidebar. Order
 * here drives sidebar order, so the most commonly browsed categories
 * come first.
 */
export const APP_CATEGORIES: ReadonlyArray<AppCategory> = [
  {
    id: 'productivity',
    label: 'Productivity',
    tagline: 'Plan, capture, and ship your day.',
    icon: Rocket,
    accentColor: '#10B981',
  },
  {
    id: 'development',
    label: 'Development',
    tagline: 'Build, debug, and review code.',
    icon: Code2,
    accentColor: '#6366F1',
  },
  {
    id: 'ai',
    label: 'AI',
    tagline: 'Your local intelligence layer.',
    icon: Sparkles,
    accentColor: '#A855F7',
  },
  {
    id: 'system',
    label: 'System',
    tagline: 'Genisys itself.',
    icon: Cpu,
    accentColor: '#64748B',
  },
]

export function findCategory(id: AppCategoryId): AppCategory | undefined {
  return APP_CATEGORIES.find((c) => c.id === id)
}
