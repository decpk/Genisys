/** Convert '14:30' to '2:30 PM' */
export function formatTime(time24: string): string {
  const [hourStr, minuteStr] = time24.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = minuteStr ?? '00'
  const period = hour >= 12 ? 'PM' : 'AM'
  if (hour === 0) hour = 12
  else if (hour > 12) hour -= 12
  return `${hour}:${minute} ${period}`
}

/** Format a time range: '2:30 PM - 3:30 PM' */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

/** Returns percentage position for timeline view (0–100) based on startHour */
export function getTimeSlotPosition(time24: string, startHour: number): number {
  const [hourStr, minuteStr] = time24.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr ?? '0', 10)
  const totalMinutesFromStart = (hour - startHour) * 60 + minute
  const totalVisibleMinutes = (24 - startHour) * 60
  return Math.max(0, Math.min(100, (totalMinutesFromStart / totalVisibleMinutes) * 100))
}

/** Returns height in pixels based on duration (1 hour = 60px) */
export function getTimeSlotHeight(durationMinutes: number): number {
  return durationMinutes
}

/** Returns current time as 'HH:mm' */
export function getCurrentTime24(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
