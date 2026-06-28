/**
 * Tailwind class fragments for the toolbar `NotesExportMenu`.
 *
 * Kept narrow on purpose — most of the styling rides on the existing
 * `<Button>` variants from `@/components/ui/button`; these constants
 * only fill the gaps (item rows, content surface, label/description
 * stack inside each row).
 */
export const notesExportMenuStyles = {
  /** Wraps `DropdownMenuContent` — mirrors `BookExportMenu`. */
  content:
    'z-50 min-w-[170px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95',

  /** Each format row inside the dropdown. */
  item:
    'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors text-foreground/80 hover:bg-secondary disabled:opacity-50',

  /** Stacked text container (label + optional description). */
  itemTextStack: 'flex flex-col',

  /** Secondary description text under the format label. */
  itemDescription: 'text-[10px] text-muted-foreground',
}
