import { parse } from 'date-fns'

export function parseTimeString(time: string | null): Date | undefined {
  if (!time) return undefined

  return parse(time, 'HH:mm', new Date())
}
