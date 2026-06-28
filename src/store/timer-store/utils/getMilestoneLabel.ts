const LABELS: Record<string, string> = {
  'first-session': 'First Session',
  '50-sessions': '50 Sessions',
  '100-sessions': '100 Sessions',
  '10h-focus': '10 Hours of Focus',
  '7-day-streak': '7-Day Streak',
  '30-day-streak': '30-Day Streak',
  'daily-goal-met': 'Daily Goal Met',
  'weekly-goal-met': 'Weekly Goal Met',
}

export function getMilestoneLabel(key: string): string {
  return LABELS[key] ?? key
}
