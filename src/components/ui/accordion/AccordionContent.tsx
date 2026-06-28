import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import { useAccordionVariant } from './accordion.context'
import { accordionContentVariants } from './accordion.variants'
import type { AccordionContentProps } from './accordion.types'

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const variant = useAccordionVariant()
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(accordionContentVariants({ variant }), className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Content>
  )
}
