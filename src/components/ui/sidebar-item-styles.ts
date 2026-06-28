// Shared sidebar item styles — unified across all app sidebars.
// Modelled after the Explorer RepoHistory design.

export const SIDEBAR_ITEM_BASE =
  'w-full text-left rounded-md px-2 py-2 transition-colors cursor-pointer group'

export const SIDEBAR_ITEM_ACTIVE = 'bg-primary/10 border border-primary/30'

export const SIDEBAR_ITEM_INACTIVE = 'border border-transparent hover:bg-secondary'

export const SIDEBAR_LIST_CONTAINER = 'flex-1 overflow-y-auto px-1.5 pb-2'

export const SIDEBAR_SEARCH_WRAPPER = 'px-2.5 py-2'

export const SIDEBAR_SUB_ITEM =
  'w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[11px] transition-colors cursor-pointer text-left min-w-0 text-muted-foreground hover:text-foreground hover:bg-secondary'

export const SIDEBAR_DELETE_BUTTON =
  'opacity-0 group-hover:opacity-100 p-0.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer shrink-0'
