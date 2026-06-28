import { cn } from '@/lib/utils'

import { AppLoaderGlyph } from './AppLoaderGlyph'

interface AppLoaderProps {
  size?: number
  text?: string | null
  className?: string
  fullScreen?: boolean
}

export function AppLoader({
  size = 32,
  text = 'Loading…',
  className,
  fullScreen = true,
}: AppLoaderProps = {}): React.JSX.Element {
  const inner = (
    <div className={cn('flex flex-col items-center gap-3', !fullScreen && className)}>
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <AppLoaderGlyph size={size} />
      </div>
      {text != null && (
        <span className="text-xs text-muted-foreground animate-breathe whitespace-nowrap">{text}</span>
      )}
    </div>
  )

  if (!fullScreen) return inner

  return (
    <div className={cn('flex h-full w-full items-center justify-center bg-background', className)}>
      {inner}
    </div>
  )
}
