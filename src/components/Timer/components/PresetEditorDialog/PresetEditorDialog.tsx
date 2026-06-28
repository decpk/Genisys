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
import { Textarea } from '@/components/ui/textarea'
import type { TimerMode } from '@/store/timer-store/timer-store.types'

import { SoundPicker } from '../NewTimerDialog/components/SoundPicker'
import { ThemePicker } from '../NewTimerDialog/components/ThemePicker'

import { PresetBestForList } from './components/PresetBestForList'
import { PresetDurationInputs } from './components/PresetDurationInputs'
import { PresetIconPicker } from './components/PresetIconPicker'
import type { PresetEditorDialogProps } from './PresetEditorDialog.types'
import { usePresetEditorDialogData } from './usePresetEditorDialogData'

const DIALOG_TITLES: Record<PresetEditorDialogProps['mode'], string> = {
  create: 'New Preset',
  edit: 'Edit Preset',
  duplicate: 'Duplicate Preset',
}

export function PresetEditorDialog(
  props: PresetEditorDialogProps,
): React.JSX.Element {
  const { open, onOpenChange, mode, source } = props
  const {
    form,
    submitLabel,
    setLabel,
    setMode,
    setWorkSec,
    setBreakSec,
    setIconKey,
    setTagline,
    setDescription,
    setBestFor,
    setThemeId,
    setSoundProfileId,
    setAutoStartBreak,
    submit,
  } = usePresetEditorDialogData({ open, mode, source })

  const handleModeChange = (v: string) => setMode(v as TimerMode)
  const handleSubmit = () => {
    const ok = submit()
    if (ok) onOpenChange(false)
  }
  const handleCancel = () => onOpenChange(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{DIALOG_TITLES[mode]}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Label</label>
            <Input
              value={form.label}
              placeholder="My Custom Preset"
              onChange={(e) => setLabel(e.target.value)}
            />
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

          <PresetDurationInputs
            mode={form.mode}
            workSec={form.workSec}
            breakSec={form.breakSec}
            onWorkChange={setWorkSec}
            onBreakChange={setBreakSec}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Icon</label>
            <PresetIconPicker value={form.iconKey} onChange={setIconKey} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Tagline</label>
            <Input
              value={form.tagline}
              placeholder="One-line summary"
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea
              value={form.description}
              rows={3}
              placeholder="What is this preset for? When should you use it?"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Best for</label>
            <PresetBestForList value={form.bestFor} onChange={setBestFor} />
          </div>

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
            <Switch
              checked={form.autoStartBreak}
              onCheckedChange={setAutoStartBreak}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
