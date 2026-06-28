export const EQUALIZER_WRAPPER = 'inline-flex items-end justify-center gap-[2px]'

export const EQUALIZER_BAR = 'w-[2px] rounded-sm bg-current'

export const EQUALIZER_KEYFRAMES = `@keyframes settings-eq-bar-bounce {
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
}`

export const EQUALIZER_BAR_HEIGHTS: ReadonlyArray<string> = ['60%', '100%', '75%']

export const EQUALIZER_BAR_DELAYS: ReadonlyArray<string> = ['0ms', '150ms', '300ms']
