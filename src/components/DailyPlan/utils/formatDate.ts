function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Format 'YYYY-MM-DD' to 'Mon, Apr 26, 2026' */
export function formatDate(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Format 'YYYY-MM-DD' to 'Apr 26' */
export function formatDateShort(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Format 'YYYY-MM-DD' to 'Monday, April 26, 2026' */
export function formatDateFull(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Returns today as 'YYYY-MM-DD' */
export function getToday(): string {
  return toDateStr(new Date())
}

/** Returns tomorrow as 'YYYY-MM-DD' */
export function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toDateStr(d)
}

/** Returns yesterday as 'YYYY-MM-DD' */
export function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday()
}

export function isFutureDate(dateStr: string): boolean {
  return dateStr > getToday()
}

export function isPastDate(dateStr: string): boolean {
  return dateStr < getToday()
}

/** Add (or subtract) days from a YYYY-MM-DD string */
export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr)
  date.setDate(date.getDate() + days)
  return toDateStr(date)
}

/** Get Mon–Sun range for the week containing dateStr */
export function getWeekRange(dateStr: string): { start: string; end: string } {
  const date = parseDate(dateStr)
  const day = date.getDay() // 0=Sun, 1=Mon, ...
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diffToMon)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: toDateStr(monday), end: toDateStr(sunday) }
}

/** Get first and last day of the month containing dateStr */
export function getMonthRange(dateStr: string): { start: string; end: string } {
  const date = parseDate(dateStr)
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start: toDateStr(first), end: toDateStr(last) }
}

/** Array of all YYYY-MM-DD dates in the month containing dateStr */
export function getDaysInMonth(dateStr: string): string[] {
  const date = parseDate(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const days: string[] = []
  for (let d = 1; d <= lastDay; d++) {
    days.push(toDateStr(new Date(year, month, d)))
  }
  return days
}

/** Returns short day name: 'Mon', 'Tue', etc. */
export function getDayOfWeek(dateStr: string): string {
  const date = parseDate(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

/** Returns array of 7 YYYY-MM-DD dates starting from startDate */
export function getWeekDays(startDate: string): string[] {
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i))
  }
  return days
}
