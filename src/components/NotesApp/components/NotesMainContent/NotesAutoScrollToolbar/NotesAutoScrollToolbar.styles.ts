/**
 * Styling constants for Notes Auto-Scroll Toolbar.
 * Follows the same design tokens as NotesMainContent top toolbar.
 */

export const notesAutoScrollToolbarStyles = {
  // Container (bottom toolbar)
  container:
    'flex items-center justify-between gap-3 px-3 h-12 border-t border-border/40 shrink-0 bg-card',

  // Left section (label + state indicator)
  leftSection: 'flex items-center gap-2 shrink-0',
  label: 'text-xs font-medium text-muted-foreground/60',
  stateIndicator: 'text-xs text-muted-foreground/50',

  // Center section (controls)
  centerSection: 'flex items-center gap-3 flex-1 justify-center',

  // Right section (compact for mobile)
  rightSection: 'flex items-center gap-2 shrink-0',

  // Segmented mode toggle (Continuous / Stepped)
  modeToggle:
    'inline-flex items-center gap-0.5 p-0.5 rounded-md bg-secondary/40 border border-border/40 shrink-0',
  modeToggleBtn:
    'inline-flex items-center gap-1 h-6 px-2 rounded text-[11px] font-medium transition-all duration-150 cursor-pointer',
  modeToggleBtnActive: 'bg-card text-foreground shadow-sm',
  modeToggleBtnIdle: 'text-muted-foreground/70 hover:text-foreground',

  // Mode group wrapper (toggle + info icon)
  modeGroup: 'inline-flex items-center gap-1.5 shrink-0',

  // Info icon trigger sitting to the right of the mode toggle
  infoIconBtn:
    'inline-flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-secondary/60 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',

  // Info popover content
  infoPopover: 'w-72 p-3',
  infoPopoverTitle: 'flex items-center gap-1.5 text-xs font-semibold text-foreground whitespace-nowrap',
  infoPopoverBody: 'mt-1.5 text-[11px] leading-relaxed text-muted-foreground',

  // Buttons
  playPauseBtn:
    'inline-flex items-center justify-center h-7 px-2.5 rounded-md border transition-all duration-150 cursor-pointer font-medium text-xs',
  playPauseBtnActive:
    'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 hover:border-primary/30',
  playPauseBtnIdle:
    'bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground',

  // Speed slider container
  sliderContainer: 'flex items-center gap-2',
  sliderLabel: 'text-xs text-muted-foreground/60 min-w-fit',
  sliderValue: 'text-xs font-medium text-foreground min-w-[2.5rem] text-right',

  // Slider column (slider + tick marks stacked vertically)
  sliderColumn: 'flex flex-col gap-1',

  // Tick mark row (positioned beneath the slider track)
  tickRow: 'relative w-72 h-3',
  tick:
    'absolute top-0 -translate-x-1/2 flex flex-col items-center cursor-pointer group focus-visible:outline-none',
  tickIdle: '',
  tickActive: 'active',
  tickDot:
    'block w-px h-1.5 rounded-full bg-border group-hover:bg-primary group-[.active]:bg-primary transition-colors',
  tickDotMajor: 'h-2 bg-border/80',
  tickLabel:
    'mt-0.5 text-[8px] leading-none text-muted-foreground/40 group-hover:text-foreground transition-colors whitespace-nowrap',

  // Slider (uses radix-ui primitives)
  sliderTrack: 'relative h-1 w-32 bg-secondary/60 rounded-full',
  sliderRange: 'absolute h-full bg-primary rounded-full',
  sliderThumb: 'inline-flex h-4 w-4 rounded-full border-2 border-primary bg-card shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',

  // Stepped-mode controls (pixel distance + wait interval sliders)
  stepContainer: 'flex items-center gap-4',
  stepField: 'flex items-center gap-2',
  stepLabel: 'text-xs text-muted-foreground/60 min-w-fit',
  stepValue: 'text-xs font-medium text-foreground min-w-[2.75rem] text-right tabular-nums',

  // Countdown pill (time until next scroll step)
  countdown:
    'inline-flex items-center gap-1 h-6 px-2 rounded-full border text-[11px] font-semibold tabular-nums transition-colors duration-300',
  countdownCalm: 'bg-white text-zinc-900 border-zinc-300',
  countdownWarn: 'bg-orange-500 text-white border-orange-600',
  countdownUrgent: 'bg-red-500 text-white border-red-600 animate-pulse',
  countdownUnit: 'text-[9px] font-medium opacity-70',
} as const;
