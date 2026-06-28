export function safeMeetingMinutes(m: Record<string, unknown>): number {
  try {
    if (m.status === 'cancelled' || m.status === 'no_show') return 0
    const start = (m.startTime || m.start_time) as string | undefined
    const end = (m.endTime || m.end_time) as string | undefined
    if (!start || !end) return 0
    const [sh, sm] = String(start).split(':').map(Number)
    const [eh, em] = String(end).split(':').map(Number)
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0
    return Math.max((eh * 60 + em) - (sh * 60 + sm), 0)
  } catch {
    return 0
  }
}
