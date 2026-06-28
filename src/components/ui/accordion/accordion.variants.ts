import { cva } from 'class-variance-authority'

/**
 * Controls the visual density and tone of accordion items.
 *
 * - default  → standard border separator, normal padding
 *              (panels, settings pages, detail sections)
 * - compact  → tighter padding, no item borders
 *              (sidebars, dense tree areas)
 * - subtle   → no borders, ghost background on open
 *              (inline sections, cards)
 */
export type AccordionVariant = 'default' | 'compact' | 'subtle'

export const accordionItemVariants = cva('', {
  variants: {
    variant: {
      default: 'border-b border-border/50 last:border-b-0',
      compact: '',
      subtle: '',
    },
  },
  defaultVariants: { variant: 'default' },
})

export const accordionTriggerVariants = cva(
  [
    'flex w-full items-center gap-2 text-sm font-medium transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer',
  ],
  {
    variants: {
      variant: {
        default:
          'justify-between px-4 py-3 hover:bg-accent/50 rounded-md text-foreground/90 hover:text-foreground',
        compact:
          'justify-between px-2 py-1.5 hover:bg-accent/40 rounded-md text-[12px] text-foreground/80 hover:text-foreground',
        subtle:
          'justify-between px-3 py-2 hover:bg-accent/30 rounded-md text-foreground/80 hover:text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export const accordionContentVariants = cva(
  [
    'overflow-hidden text-sm',
    'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
  ],
  {
    variants: {
      variant: {
        default: 'px-4 pb-3',
        compact: 'px-2 pb-1.5',
        subtle: 'px-3 pb-2',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)
