import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

import { AccordionVariantContext } from './accordion.context'
import type { AccordionProps } from './accordion.types'

export function Accordion({ variant = 'default', className, ...props }: AccordionProps) {
  return (
    <AccordionVariantContext.Provider value={variant}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        data-variant={variant}
        className={cn('w-full', className)}
        {...(props as React.ComponentProps<typeof AccordionPrimitive.Root>)}
      />
    </AccordionVariantContext.Provider>
  )
}
