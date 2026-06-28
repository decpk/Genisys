export function formatChangeAbs(
  value: number | null | undefined,
  currency?: string | null,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const abs = Math.abs(value)
  const fractionDigits = abs >= 1000 ? 0 : abs >= 1 ? 2 : 4
  const num = abs.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  if (!currency) return `${sign}${num}`
  if (currency === 'USD') return `${sign}$${num}`
  if (currency === 'EUR') return `${sign}€${num}`
  if (currency === 'GBP') return `${sign}£${num}`
  return `${sign}${num} ${currency}`
}
