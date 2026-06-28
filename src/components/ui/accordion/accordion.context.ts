import * as React from 'react'

import type { AccordionVariant } from './accordion.variants'

export const AccordionVariantContext = React.createContext<AccordionVariant>('default')

export function useAccordionVariant(): AccordionVariant {
  return React.useContext(AccordionVariantContext)
}
