/**
 * Returns true when the given event target is rendered inside a Radix
 * `HoverCardContent` node (identified by the `data-slot="hover-card-content"`
 * attribute set in `@/components/ui/hover-card`).
 *
 * Used by `PromptPicker` to keep its popover open while the user interacts
 * with a hover preview — the preview is portaled to `document.body`, so
 * Radix Popover would otherwise treat clicks/selections inside the preview
 * as "outside" interactions and close itself.
 */
export function isHoverCardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return target.closest('[data-slot="hover-card-content"]') !== null
}
