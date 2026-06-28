export interface DurationSlidersProps {
  workSec: number
  shortBreakSec: number
  longBreakSec: number
  onWorkChange: (sec: number) => void
  onShortBreakChange: (sec: number) => void
  onLongBreakChange: (sec: number) => void
}
