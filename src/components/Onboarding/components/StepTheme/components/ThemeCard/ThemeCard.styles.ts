export const THEME_CARD_STYLES = {
  container:
    'relative rounded-2xl transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02]',
  button: 'block w-full text-left overflow-hidden',
  preview: 'relative',
  titleBar: 'flex items-center gap-1 px-2',
  trafficDot: 'w-1.5 h-1.5 rounded-full',
  body: 'flex',
  sidebar: 'shrink-0 h-full',
  content: 'flex-1 flex flex-col justify-center gap-1.5 px-2.5',
  line: 'rounded-full',
  pill: 'rounded-full mt-0.5',
  checkBadge:
    'absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center',
  nameRow: 'flex items-center gap-2 px-3 py-2',
  nameDot: 'w-1.5 h-1.5 rounded-full shrink-0',
  name: 'text-[11px] font-medium truncate',
} as const
