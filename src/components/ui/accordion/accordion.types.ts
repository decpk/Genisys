import type { Accordion as AccordionPrimitive } from 'radix-ui'

import type { AccordionVariant } from './accordion.variants'

// ─── Variant re-export ────────────────────────────────────────────────────────
export type { AccordionVariant }

// ─── Root ─────────────────────────────────────────────────────────────────────
type AccordionBasePropExtension = {
  variant?: AccordionVariant
}

export type AccordionSingleProps = React.ComponentProps<typeof AccordionPrimitive.Root> &
  AccordionBasePropExtension & {
    type: 'single'
    collapsible?: boolean
  }

export type AccordionMultipleProps = React.ComponentProps<typeof AccordionPrimitive.Root> &
  AccordionBasePropExtension & {
    type: 'multiple'
  }

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps

// ─── Item ─────────────────────────────────────────────────────────────────────
export type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>

// ─── Trigger ──────────────────────────────────────────────────────────────────
export type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
> & {
  /** Suppress the built-in animated chevron; useful when the caller provides a custom indicator. */
  hideChevron?: boolean
}

// ─── Content ──────────────────────────────────────────────────────────────────
export type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>
