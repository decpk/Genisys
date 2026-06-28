import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import { useAccordionVariant } from './accordion.context'
import { accordionItemVariants } from './accordion.variants'
import type { AccordionItemProps } from './accordion.types'

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  const variant = useAccordionVariant()
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(accordionItemVariants({ variant }), className)}
      {...props}
    />
  )
}
