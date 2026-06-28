import { useCallback, useState } from 'react'
import { Send, Play } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from '@/components/ui/popover'
import type { MockEndpoint } from '@/components/MockServer/MockServer.types'

import { useTestInApiClientButtonData } from './useTestInApiClientButtonData'

interface TestInApiClientButtonProps {
  endpoint: MockEndpoint
  isActive: boolean
}

export function TestInApiClientButton(props: TestInApiClientButtonProps) {
  const { endpoint, isActive } = props
  const { canTest, isServerRunning, handleStartServer, handleTest } =
    useTestInApiClientButtonData(endpoint)

  const [open, setOpen] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const iconClassName = cn(
    'flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-all hover:bg-foreground/10 hover:text-foreground',
    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
  )

  const handleStartAndTest = useCallback(async () => {
    setIsStarting(true)
    try {
      const started = await handleStartServer()
      if (started) {
        setOpen(false)
        await handleTest()
      }
    } finally {
      setIsStarting(false)
    }
  }, [handleStartServer, handleTest])

  if (!canTest) return null

  if (isServerRunning) {
    return (
      <Tooltip content="Test in API Client" side="top">
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation()
            handleTest()
          }}
          className={iconClassName}
        >
          <Send className="h-3 w-3" />
        </span>
      </Tooltip>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          role="button"
          onClick={(e) => e.stopPropagation()}
          className={iconClassName}
        >
          <Send className="h-3 w-3" />
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-64"
        onClick={(e) => e.stopPropagation()}
      >
        <PopoverHeader>
          <PopoverTitle>Server not running</PopoverTitle>
          <PopoverDescription>
            Start the mock server to test this endpoint in the API Client.
          </PopoverDescription>
        </PopoverHeader>
        <Button
          size="sm"
          className="mt-3 w-full"
          disabled={isStarting}
          onClick={handleStartAndTest}
        >
          <Play className="h-3.5 w-3.5" />
          {isStarting ? 'Starting…' : 'Start server'}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
