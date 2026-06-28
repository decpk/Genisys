import type { ClipboardCodeViewMode } from './ClipboardCodeView.types'

/**
 * Outer wrapper styles for the highlighted Shiki HTML output.
 *
 * Uses `[&>pre]:!` selectors to forcefully override Shiki's inline <pre> styles
 * so the rendered code respects our card/modal layout envelopes instead of
 * Shiki's default theme background and padding.
 *
 * `[&_pre]:!font-sans [&_code]:!font-sans` forces Shiki's highlighted output
 * to inherit the user's selected global font (`--font-sans`) instead of the
 * browser/Shiki default monospace, so code items match plain-text items
 * visually.
 */
export const CONTAINER_STYLES: Record<ClipboardCodeViewMode, string> = {
  card:
    'overflow-hidden line-clamp-3 ' +
    '[&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:!p-0 ' +
    '[&>pre]:!whitespace-pre-wrap [&>pre]:!break-all [&>pre]:!rounded-none ' +
    '[&_pre]:!font-sans [&_code]:!font-sans ' +
    '[&_code]:!text-[13px] [&_code]:!leading-relaxed',
  modal:
    'overflow-x-auto ' +
    '[&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:p-4 [&>pre]:!rounded-none ' +
    '[&_pre]:!font-sans [&_code]:!font-sans ' +
    '[&_code]:!text-sm [&_code]:!leading-6',
}

/** Plain <pre> classes used while Shiki is loading or for unsupported langs. */
export const FALLBACK_PRE_STYLES: Record<ClipboardCodeViewMode, string> = {
  card: 'font-sans m-0 p-0 bg-transparent whitespace-pre-wrap break-all line-clamp-3',
  modal: 'font-sans m-0 p-4 bg-transparent overflow-x-auto whitespace-pre-wrap break-all',
}

/**
 * Plain <code> classes used inside the fallback <pre>. Intentionally inherits
 * the global font (`--font-sans`) instead of `font-mono` so code items render
 * in the same typeface as plain-text clipboard items.
 */
export const FALLBACK_CODE_STYLES: Record<ClipboardCodeViewMode, string> = {
  card: 'font-sans text-[13px] text-foreground/80 leading-relaxed',
  modal: 'font-sans text-sm text-foreground/90 leading-6',
}
