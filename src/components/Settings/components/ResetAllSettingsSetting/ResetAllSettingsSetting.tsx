import { memo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { SettingRow } from '../SettingRow'

export const ResetAllSettingsSetting = memo(function ResetAllSettingsSetting(): React.JSX.Element {
  const [open, setOpen] = useState(false)

  const handleReset = async () => {
    await window.api.resetAllSettings()
    window.location.reload()
  }

  return (
    <SettingRow
      label="Reset all settings"
      description="Reset all application settings to their default values. Your data (history, projects, conversations) will not be affected. The app will reload after resetting."
    >
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RotateCcw />
            Reset settings
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all application settings to their default values. Your data
              (history, projects, conversations) will not be affected. The app will reload
              after resetting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Reset settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingRow>
  )
})
