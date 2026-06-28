import { ChevronDown } from 'lucide-react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import { useAccordionVariant } from './accordion.context'
import { accordionTriggerVariants } from './accordion.variants'
import type { AccordionTriggerProps } from './accordion.types'

/**
 * AccordionTrigger renders the clickable header row.
 *
 * By default it appends an animated ChevronDown indicator on the right.
 * Pass `hideChevron` to suppress it — useful when the caller renders a custom
 * icon or embeds the trigger inside a context-menu trigger.
 */
export function AccordionTrigger({
  className,
  children,
  hideChevron = false,
  ...props
}: AccordionTriggerProps) {
  const variant = useAccordionVariant()
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(accordionTriggerVariants({ variant }), className)}
        {...props}
      >
        {children}
        {!hideChevron && (
          <ChevronDown
            size={14}
            className="shrink-0 text-muted-foreground/60 transition-transform duration-200 [[data-state=open]_&]:rotate-180"
            aria-hidden
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
