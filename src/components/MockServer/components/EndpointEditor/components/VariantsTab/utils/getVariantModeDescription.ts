import type { VariantMode } from '@/components/MockServer/MockServer.types'

const DESCRIPTIONS: Record<VariantMode, string> = {
  single:
    "Single response — the endpoint's base response is always returned. Switch to Sequence, Conditional, or Random to add variants.",
  sequence:
    'Sequence — variants are returned in order, cycling back to the first after the last one is reached.',
  conditional:
    'Conditional — the first variant whose match rules all pass is returned; otherwise the base response is used.',
  random:
    "Random — a variant is chosen at random on every request, weighted by each variant's weight.",
}

export function getVariantModeDescription(mode: VariantMode): string {
  return DESCRIPTIONS[mode] ?? DESCRIPTIONS.single
}
