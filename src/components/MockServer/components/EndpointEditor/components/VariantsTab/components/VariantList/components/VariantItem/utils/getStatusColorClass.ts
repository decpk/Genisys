export function getStatusColorClass(code: number): string {
  if (code >= 200 && code < 300) return 'bg-emerald-500/10 text-emerald-500'
  if (code >= 300 && code < 400) return 'bg-blue-500/10 text-blue-500'
  if (code >= 400 && code < 500) return 'bg-amber-500/10 text-amber-500'
  if (code >= 500) return 'bg-red-500/10 text-red-500'
  return 'bg-muted text-muted-foreground'
}
