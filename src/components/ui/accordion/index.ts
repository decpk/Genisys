// ─── Components ───────────────────────────────────────────────────────────────
export { Accordion } from './Accordion'
export { AccordionItem } from './AccordionItem'
export { AccordionTrigger } from './AccordionTrigger'
export { AccordionContent } from './AccordionContent'

// ─── Variants (for callers that need to extend or compose them) ───────────────
export {
  accordionItemVariants,
  accordionTriggerVariants,
  accordionContentVariants,
} from './accordion.variants'

// ─── Types ────────────────────────────────────────────────────────────────────
export type { AccordionVariant } from './accordion.variants'
export type {
  AccordionProps,
  AccordionSingleProps,
  AccordionMultipleProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from './accordion.types'
