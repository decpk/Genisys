/**
 * Converts a `HH:MM` 24-hour string into a friendly 12-hour label
 * (e.g. `14:30` → `2:30 PM`). Returns `''` for invalid input.
 */
export function formatTime12h(time: string | null | undefined): string {
  if (!time) return ''
  const match = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!match) return ''
  const h24 = Number(match[1])
  const m = match[2]
  if (Number.isNaN(h24)) return ''
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${m} ${period}`
}
