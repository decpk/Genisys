export interface DailyGoalCardProps {
  achievedMinutes: number
  targetMinutes: number
  onTargetChange: (minutes: number) => void
}
