/**
 * Tailwind class fragments for the context-menu `NotesExportSubmenu`.
 *
 * The radix-styled `<ContextMenuSubContent>` already provides all
 * surface styling — these constants only handle the small bits that
 * are specific to export items (the optional "PDF / HTML" descriptor
 * underneath each format label).
 */
export const notesExportSubmenuStyles = {
  /** Stacked text container (label + optional description) inside each row. */
  itemTextStack: 'flex flex-col leading-tight',

  /** Secondary description text under the format label. */
  itemDescription: 'text-[10px] text-muted-foreground/70',

  /** Empty-state row shown when no formats are registered. */
  emptyRow:
    'px-2.5 py-2 text-[11px] text-muted-foreground/60 italic',
}
