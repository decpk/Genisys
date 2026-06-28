import type { ReactElement } from 'react'

import type { BlockRenderProps } from '@/frameworks/block-kit'

import { resolveCalloutVariant } from './Callout.constants'

/**
 * Renders a `<lib-callout variant="…">` block as a styled card. The body is the
 * already-rendered markdown children — no marker stripping needed because the
 * HTML tag is itself the unambiguous delimiter.
 */
export function CalloutBlock({ attrs, children }: BlockRenderProps): ReactElement {
  const config = resolveCalloutVariant(attrs.variant)
  const Icon = config.icon

  return (
    <div
      className={`my-5 rounded-xl ${config.bg} border ${config.border} px-4 py-3.5 scroll-mt-20`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className={config.iconColor} />
        <span
          className={`text-[12px] font-semibold uppercase tracking-wider ${config.labelColor}`}
        >
          {config.label}
        </span>
      </div>
      <div className="text-foreground/80 [&>p]:!m-0 [&>p]:leading-7 [&>p]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}
