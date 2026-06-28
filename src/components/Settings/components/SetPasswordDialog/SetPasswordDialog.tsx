import { useState, useCallback, useRef, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { useSettingsStore, type SecurityType } from '@/store/settings-store'
import { hashPassword, verifyPassword } from '@/lib/crypto'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PinInput } from '@/components/LockScreen/PinInput'

interface SetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'setup' | 'change'
  targetType?: SecurityType
}

export function SetPasswordDialog({
  open,
  onOpenChange,
  mode,
  targetType,
}: SetPasswordDialogProps): React.JSX.Element {
  const securityType = useSettingsStore((s) => s.securityType)
  const securityHash = useSettingsStore((s) => s.securityHash)
  const securitySalt = useSettingsStore((s) => s.securitySalt)
  const setSecurityEnabled = useSettingsStore((s) => s.setSecurityEnabled)
  const setSecurityType = useSettingsStore((s) => s.setSecurityType)
  const setSecurityCredentials = useSettingsStore((s) => s.setSecurityCredentials)

  const effectiveType = targetType ?? securityType
  const isPin = effectiveType === 'pin'

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinStep, setPinStep] = useState<'new' | 'confirm'>('new')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const newPasswordRef = useRef<HTMLInputElement>(null)

  const needsCurrent = mode === 'change' && securityHash

  useEffect(() => {
    if (open) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setNewPin('')
      setConfirmPin('')
      setPinStep('new')
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
      setError('')
      setSaving(false)
    }
  }, [open])

  // Focus new password field when dialog opens
  useEffect(() => {
    if (open && !isPin) {
      setTimeout(() => newPasswordRef.current?.focus(), 200)
    }
  }, [open, isPin])

  const getPasswordStrength = useCallback((pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: '', color: '', width: '0%' }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[^a-zA-Z\d]/.test(pw)) score++

    if (score <= 1) return { label: 'Weak', color: 'bg-destructive', width: '20%' }
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: '40%' }
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%' }
    if (score <= 4) return { label: 'Strong', color: 'bg-emerald-500', width: '80%' }
    return { label: 'Very Strong', color: 'bg-emerald-500', width: '100%' }
  }, [])

  const handleSave = useCallback(async () => {
    setError('')
    setSaving(true)

    try {
      // Verify current password if changing
      if (needsCurrent) {
        const isValid = await verifyPassword(currentPassword, securityHash, securitySalt)
        if (!isValid) {
          setError('Current ' + (securityType === 'pin' ? 'PIN' : 'password') + ' is incorrect')
          setSaving(false)
          return
        }
      }

      if (isPin) {
        if (newPin.length < 4) {
          setError('PIN must be at least 4 digits')
          setSaving(false)
          return
        }
        if (newPin !== confirmPin) {
          setError('PINs do not match')
          setSaving(false)
          return
        }

        const { hash, salt } = await hashPassword(newPin)
        setSecurityCredentials(hash, salt)
        if (targetType) setSecurityType(targetType)
        if (mode === 'setup') setSecurityEnabled(true)
      } else {
        if (newPassword.length < 8) {
          setError('Password must be at least 8 characters')
          setSaving(false)
          return
        }
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match')
          setSaving(false)
          return
        }

        const { hash, salt } = await hashPassword(newPassword)
        setSecurityCredentials(hash, salt)
        if (targetType) setSecurityType(targetType)
        if (mode === 'setup') setSecurityEnabled(true)
      }

      onOpenChange(false)
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [
    needsCurrent, currentPassword, securityHash, securitySalt, securityType,
    isPin, newPin, confirmPin, newPassword, confirmPassword,
    setSecurityCredentials, setSecurityType, setSecurityEnabled,
    mode, targetType, onOpenChange,
  ])

  const strength = !isPin ? getPasswordStrength(newPassword) : null

  const title = mode === 'setup'
    ? isPin ? 'Set up PIN' : 'Set up Password'
    : isPin ? 'Change PIN' : 'Change Password'

  const description = mode === 'setup'
    ? isPin ? 'Create a 4–6 digit PIN to lock your app.' : 'Create a password to protect your app.'
    : isPin ? 'Enter your current credentials and set a new PIN.' : 'Enter your current password and set a new one.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!saving}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Current password */}
          {needsCurrent && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Current {securityType === 'pin' ? 'PIN' : 'Password'}
              </label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    if (error) setError('')
                  }}
                  autoComplete="off"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New credential */}
          {isPin ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block text-center">
                {pinStep === 'new' ? 'Enter new PIN' : 'Confirm PIN'}
              </label>
              {pinStep === 'new' ? (
                <PinInput
                  length={6}
                  value={newPin}
                  onChange={setNewPin}
                  onComplete={() => setPinStep('confirm')}
                  disabled={saving}
                />
              ) : (
                <PinInput
                  length={6}
                  value={confirmPin}
                  onChange={setConfirmPin}
                  onComplete={() => handleSave()}
                  disabled={saving}
                  error={!!error && error.includes('match')}
                />
              )}
              {pinStep === 'confirm' && (
                <button
                  type="button"
                  onClick={() => { setPinStep('new'); setConfirmPin(''); setError('') }}
                  className="text-xs text-muted-foreground hover:text-foreground mt-2 mx-auto block transition-colors"
                >
                  Re-enter PIN
                </button>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    ref={newPasswordRef}
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {strength && newPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{strength.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          {/* For PIN mode, save is triggered by onComplete; for password mode, explicit button */}
          {!isPin && (
            <Button onClick={handleSave} disabled={saving || !newPassword || !confirmPassword}>
              {saving ? 'Saving…' : mode === 'setup' ? 'Enable Security' : 'Update Password'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
