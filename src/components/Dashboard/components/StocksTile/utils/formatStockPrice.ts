export function formatStockPrice(value: number | null | undefined, currency?: string | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const abs = Math.abs(value)
  const fractionDigits = abs >= 1000 ? 0 : abs >= 1 ? 2 : 4
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  if (!currency) return formatted
  if (currency === 'USD') return `$${formatted}`
  if (currency === 'EUR') return `€${formatted}`
  if (currency === 'GBP') return `£${formatted}`
  return `${formatted} ${currency}`
}
