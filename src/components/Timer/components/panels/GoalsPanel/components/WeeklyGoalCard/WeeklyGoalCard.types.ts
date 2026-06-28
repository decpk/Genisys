export interface WeeklyGoalCardProps {
  achievedMinutes: number
  targetMinutes: number
  onTargetChange: (minutes: number) => void
}
