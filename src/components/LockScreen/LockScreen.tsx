import { useState, useCallback, useEffect, useRef } from 'react'
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react'

import { useSettingsStore } from '@/store/settings-store'
import { useSecurityLockStore } from '@/store/security-lock-store'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { PinInput } from './PinInput'

interface LockScreenProps {
  attemptUnlock: (input: string) => Promise<boolean>
}

export function LockScreen({ attemptUnlock }: LockScreenProps): React.JSX.Element {
  const securityType = useSettingsStore((s) => s.securityType)
  const maxFailedAttempts = useSettingsStore((s) => s.securityMaxFailedAttempts)
  const failedAttempts = useSecurityLockStore((s) => s.failedAttempts)
  const lockoutUntil = useSecurityLockStore((s) => s.lockoutUntil)

  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [shake, setShake] = useState(false)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)

  const passwordRef = useRef<HTMLInputElement>(null)

  // Focus password input on mount
  useEffect(() => {
    if (securityType === 'password') {
      setTimeout(() => passwordRef.current?.focus(), 100)
    }
  }, [securityType])

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutSeconds(0)
      return
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000))
      setLockoutSeconds(remaining)
      if (remaining <= 0) {
        useSecurityLockStore.getState().resetFailedAttempts()
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [lockoutUntil])

  const triggerShake = useCallback(() => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }, [])

  const handleUnlock = useCallback(
    async (input: string) => {
      if (!input || isVerifying || lockoutSeconds > 0) return

      setIsVerifying(true)
      setError('')
      // Clear the entered value (and any plaintext reveal) immediately so it is
      // never left visible during the async verification → unlock gap.
      setPassword('')
      setPin('')
      setShowPassword(false)

      const success = await attemptUnlock(input)

      if (!success) {
        triggerShake()
        setError('Incorrect ' + (securityType === 'pin' ? 'PIN' : 'password'))
        setTimeout(() => passwordRef.current?.focus(), 100)
      }

      setIsVerifying(false)
    },
    [attemptUnlock, isVerifying, lockoutSeconds, securityType, triggerShake]
  )

  const handlePasswordSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      handleUnlock(password)
    },
    [password, handleUnlock]
  )

  const handlePinComplete = useCallback(
    (value: string) => {
      handleUnlock(value)
    },
    [handleUnlock]
  )

  const isLockedOut = lockoutSeconds > 0

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-xl select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative w-full max-w-sm mx-4 ${shake ? 'animate-shake' : ''}`}
      >
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-2xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-foreground mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              {securityType === 'pin'
                ? 'Enter your PIN to unlock'
                : 'Enter your password to unlock'}
            </p>
          </div>

          {/* Lockout message */}
          {isLockedOut && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                Too many attempts. Try again in{' '}
                <span className="font-semibold">{lockoutSeconds}s</span>
              </p>
            </div>
          )}

          {/* PIN input */}
          {securityType === 'pin' ? (
            <div className="mb-6">
              <PinInput
                length={6}
                value={pin}
                onChange={setPin}
                onComplete={handlePinComplete}
                disabled={isVerifying || isLockedOut}
                error={!!error}
              />
            </div>
          ) : (
            /* Password input */
            <form onSubmit={handlePasswordSubmit} className="mb-6">
              <div className="relative">
                <Input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Enter password"
                  disabled={isVerifying || isLockedOut}
                  autoComplete="off"
                  className={`h-11 pr-10 ${error ? 'border-destructive ring-destructive/20' : ''}`}
                />
                <IconButton
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </IconButton>
              </div>

              <Button
                type="submit"
                disabled={!password || isVerifying || isLockedOut}
                className="w-full mt-4 h-10"
              >
                {isVerifying ? 'Verifying…' : 'Unlock'}
              </Button>
            </form>
          )}

          {/* Error message */}
          {error && !isLockedOut && (
            <p className="text-sm text-destructive text-center -mt-3 mb-3">
              {error}
            </p>
          )}

          {/* Failed attempts indicator */}
          {failedAttempts > 0 && !isLockedOut && (
            <p className="text-xs text-muted-foreground text-center">
              {failedAttempts} of {maxFailedAttempts} attempts used
            </p>
          )}
        </div>

        {/* Genisys branding */}
        <p className="text-xs text-muted-foreground/50 text-center mt-4">
          Genisys
        </p>
      </div>

      {/* Shake animation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
