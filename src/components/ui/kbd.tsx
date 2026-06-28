import { parseShortcut } from '@/lib/keyboard'

type KbdVariant = 'tooltip' | 'inline'
type KbdSize = 'sm' | 'md' | 'lg'

interface KbdProps {
  shortcut: string
  variant?: KbdVariant
  size?: KbdSize
}

const BASE_TOOLTIP = 'inline-flex items-center justify-center rounded-[5px] font-semibold leading-none bg-gradient-to-b from-white/25 to-white/10 border border-white/20 shadow-[0_1px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] text-background/90'
const BASE_INLINE =
  "inline-flex items-center justify-center rounded-[5px] font-semibold leading-none bg-gradient-to-b from-muted/80 to-muted/40 border border-border/80 text-foreground shadow-[0_1px_0_1px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.06)]";

const SIZE_CLASSES: Record<KbdSize, string> = {
  sm: 'min-w-[20px] h-[18px] px-1.5 text-[10px]',
  md: 'min-w-[1.5rem] h-6 px-1.5 text-[10px]',
  lg: 'min-w-[2rem] h-8 px-2.5 text-xs',
}

const GAP_CLASSES: Record<KbdSize, string> = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
}

function Kbd({ shortcut, variant = 'tooltip', size = 'sm' }: KbdProps) {
  const keys = parseShortcut(shortcut)
  const base = variant === 'tooltip' ? BASE_TOOLTIP : BASE_INLINE
  const cls = `${base} ${SIZE_CLASSES[size]}`

  return (
    <span className={`inline-flex items-center ${GAP_CLASSES[size]}`}>
      {keys.map((key, i) => (
        <kbd key={i} className={cls}>
          {key}
        </kbd>
      ))}
    </span>
  )
}

export { Kbd }
export type { KbdProps }
