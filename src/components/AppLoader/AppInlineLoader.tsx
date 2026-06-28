import { cn } from '@/lib/utils'

import { AppLoaderGlyph } from './AppLoaderGlyph'

interface AppInlineLoaderProps {
  message?: string
  size?: number
  className?: string
  messageClassName?: string
}

export function AppInlineLoader({
  message,
  size = 18,
  className,
  messageClassName,
}: AppInlineLoaderProps): React.JSX.Element {
  return (
    <div className={cn('flex items-center justify-center gap-2 text-muted-foreground', className)}>
      <AppLoaderGlyph size={size} />
      {message ? <span className={cn('text-xs', messageClassName)}>{message}</span> : null}
    </div>
  )
}