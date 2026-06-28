import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TimerMode } from '@/store/timer-store/timer-store.types'

import { DurationSliders } from './components/DurationSliders'
import { SoundPicker } from './components/SoundPicker'
import { ThemePicker } from './components/ThemePicker'
import type { NewTimerDialogProps } from './NewTimerDialog.types'
import { useNewTimerDialogData } from './useNewTimerDialogData'

export function NewTimerDialog(props: NewTimerDialogProps): React.JSX.Element {
  const { open, onOpenChange } = props
  const {
    form,
    setName,
    setMode,
    setWorkSec,
    setShortBreakSec,
    setLongBreakSec,
    setThemeId,
    setSoundProfileId,
    setAutoStartBreak,
    submit,
  } = useNewTimerDialogData()

  const handleModeChange = (v: string) => setMode(v as TimerMode)
  const handleSubmit = () => {
    submit()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Timer</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Name</label>
            <Input value={form.name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Mode</label>
            <Tabs value={form.mode} onValueChange={handleModeChange}>
              <TabsList>
                <TabsTrigger value="countdown">Countdown</TabsTrigger>
                <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <DurationSliders
            workSec={form.workSec}
            shortBreakSec={form.shortBreakSec}
            longBreakSec={form.longBreakSec}
            onWorkChange={setWorkSec}
            onShortBreakChange={setShortBreakSec}
            onLongBreakChange={setLongBreakSec}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Theme</label>
            <ThemePicker value={form.themeId} onChange={setThemeId} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Sound</label>
            <SoundPicker value={form.soundProfileId} onChange={setSoundProfileId} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Auto-start break</label>
            <Switch checked={form.autoStartBreak} onCheckedChange={setAutoStartBreak} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
