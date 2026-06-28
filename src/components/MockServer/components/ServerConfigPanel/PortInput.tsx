import { CheckCircle2, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { AppLoaderGlyph } from '@/components/AppLoader/AppLoaderGlyph'
import { Tooltip } from '@/components/Tooltip'

interface PortInputProps {
  port: number
  onPortChange: (port: number) => void
  onBlur: () => void
  portAvailable: boolean | null
  isChecking: boolean
  disabled: boolean
}

export function PortInput(props: PortInputProps) {
  const { port, onPortChange, onBlur, portAvailable, isChecking, disabled } = props

  const showAvailable = !isChecking && portAvailable === true
  const showUnavailable = !isChecking && portAvailable === false

  const statusIcon = isChecking
    ? <AppLoaderGlyph size={14} className="text-muted-foreground" />
    : showAvailable
      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      : showUnavailable
        ? <Tooltip content="Port unavailable" side="bottom"><XCircle className="h-3.5 w-3.5 text-red-500" /></Tooltip>
        : null

  return (
    <div className="relative flex flex-col">
      <div className="relative">
        <input
          type="number"
          min={1024}
          max={65535}
          value={port}
          onChange={(e) => onPortChange(Number(e.target.value))}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            "h-7 w-20 rounded-md border bg-background px-2 pr-7 text-xs text-foreground",
            "outline-none focus:ring-1 focus:ring-ring/20 focus:border-input",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            showUnavailable ? "border-red-500" : showAvailable ? "border-emerald-500" : "border-transparent",
          )}
        />
        {statusIcon && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {statusIcon}
          </div>
        )}
      </div>
    </div>
  );
}
