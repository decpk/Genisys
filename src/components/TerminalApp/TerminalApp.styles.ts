// Tailwind class strings for the standalone Terminal app. Reuses theme tokens
// so the app follows the active Genisys theme, mirroring the docked terminal.

export const terminalAppStyles = {
  shell: "h-full w-full min-h-0 bg-muted",
  root: "flex flex-col h-full w-full min-h-0 bg-background text-foreground select-none overflow-hidden",
  groupArea: "flex-1 min-h-0 min-w-0 relative",

  pane: "flex flex-col h-full w-full min-h-0 min-w-0 relative",
  paneActive: "ring-1 ring-inset ring-primary/40",
  paneBody: "flex-1 min-h-0 flex flex-row bg-background",
  // Holds the (absolute) xterm surfaces, drop zones, and the diff overlay; sits
  // left of the optional git panel inside `paneBody`'s row.
  paneSurfaces: "relative flex-1 min-w-0 min-h-0",

  split: "flex h-full w-full min-h-0 min-w-0",
  splitRow: "flex-row",
  splitCol: "flex-col",
  splitChild: "relative min-h-0 min-w-0 overflow-hidden",
  divider:
    "relative shrink-0 z-10 bg-border hover:bg-primary/60 active:bg-primary/80 transition-colors",
  dividerRow: "w-[3px] cursor-col-resize",
  dividerCol: "h-[3px] cursor-row-resize",

  // Flat VS Code / API-Client style tab strip (standalone app only). The dock
  // terminal keeps the classic tabs in `terminalStyles`. The bar is a muted
  // track with NO bottom divider, so the active chip — which takes its
  // terminal's background — meets the surface below seamlessly (no hairline gap
  // between tab and content); the active tab is marked by its top accent bar.
  // `rounded-t-lg` rounds the strip bg's own top corners (handles the top-RIGHT,
  // where no child overlaps the corner).
  tabBar: "flex items-center bg-muted/30 shrink-0 rounded-t-lg",
  // `rounded-tl-lg`: the active/first tab lives inside THIS scroll container
  // (`overflow-x-auto`), and in WebKit (Tauri WKWebView) a scroll container's
  // content ESCAPES an ancestor's `border-radius` overflow clip — so the panel
  // `root`'s rounding can't round the first tab's top-left, which paints square
  // over the corner. A scroll container DOES clip its OWN content to its own
  // radius, so rounding the container here rounds whichever tab is left-most
  // (the panel's top-LEFT corner). Only the left corner: the container's right
  // edge sits mid-strip (before the +/actions), so no `tr` rounding.
  tabs: "flex items-center min-w-0 overflow-x-auto scrollbar-none",
  // Trailing cluster of pane actions (insert prompt, share, split right/down,
  // close pane), pushed to the far right with `ml-auto` and split off by a left
  // divider; the new-tab "+" sits separately, right after the last tab.
  actions:
    "flex items-center gap-0.5 shrink-0 ml-auto border-l border-border/40 px-1.5",
  actionBtn:
    "flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors",
  // New-tab "+" button — ghost icon button that sits just after the last tab.
  tabNewBtn:
    "flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors",

  // Flat tab chips: fixed width. Only the SELECTED chip is marked — by its
  // terminal background plus a faint top hairline; non-selected chips carry no
  // divider lines (they read as a single muted track, distinguished on hover).
  tab: "group/tab relative flex items-center gap-1.5 h-9 pl-3 pr-2 w-[180px] shrink-0 text-[12px] whitespace-nowrap select-none transition-colors cursor-pointer",
  tabInactive:
    "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
  tabActive: "bg-background text-foreground",
  // Hairline along the active tab's top edge — a faint white wash so it reads as
  // a slightly-lighter-than-background highlight on the (possibly theme-filled)
  // chip, marking the selected tab without a bold accent colour.
  tabAccent: "pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-white/15",
  tabExited: "opacity-60 italic",
  tabDot: "w-2 h-2 rounded-full shrink-0 bg-emerald-500",
  tabDotExited: "w-2 h-2 rounded-full shrink-0 bg-rose-500/80",
  tabTitle: "truncate flex-1 min-w-0 text-left text-[11px]",
  // Right-side icon cluster: keeps the pin + close buttons pinned to the tab's
  // right edge.
  tabActions: "flex items-center gap-0.5 shrink-0",
  tabBadge:
    "shrink-0 text-[10px] font-mono tabular-nums px-1 py-px rounded bg-foreground/5 text-muted-foreground",
  // Close / pin hover slots mirror the API Client tab indicator: a 20px square
  // hover target that reveals on tab hover (always visible on the active tab).
  tabClose:
    "shrink-0 inline-flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-opacity duration-100 opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100",
  tabCloseActive: "opacity-100",
  tabPin:
    "shrink-0 inline-flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-opacity duration-100 opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100",
  tabPinActive: "opacity-100 text-primary hover:text-primary",
};
