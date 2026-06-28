import { memo } from 'react'
import {
  PanelLeft,
  PanelRight,
  LayoutGrid,
  PanelTop,
  PanelBottom,
  MousePointer,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

const TOGGLES = [
  { key: 'libraryDFHideSidebar', setter: 'setLibraryDFHideSidebar', label: 'Sidebar', icon: PanelLeft },
  { key: 'libraryDFHideRightPanel', setter: 'setLibraryDFHideRightPanel', label: 'Right panel', icon: PanelRight },
  { key: 'libraryDFHideActivityBar', setter: 'setLibraryDFHideActivityBar', label: 'Activity bar', icon: LayoutGrid },
  { key: 'libraryDFHideHeader', setter: 'setLibraryDFHideHeader', label: 'Toolbar', icon: PanelTop },
  { key: 'libraryDFHideBottomNav', setter: 'setLibraryDFHideBottomNav', label: 'Navigation', icon: PanelBottom },
  { key: 'libraryDFShowHeaderOnHover', setter: 'setLibraryDFShowHeaderOnHover', label: 'Reveal on hover', icon: MousePointer },
] as const

type ToggleKey = (typeof TOGGLES)[number]['key']
type SetterKey = (typeof TOGGLES)[number]['setter']
type IconType = (typeof TOGGLES)[number]['icon']

export const LibraryDistractionFreeSetting = memo(function LibraryDistractionFreeSetting(): React.JSX.Element {
  return (
    <SettingRow
      label="Distraction-free mode"
      description="Customize which elements hide when you enter distraction-free reading (⇧⌘F)."
    >
      <div className="flex items-start gap-5">
        {/* Minimap */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider px-0.5">
            Preview
          </span>
          <LayoutPreview />
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-px rounded-xl border border-border/50 bg-border/30 overflow-hidden">
          {TOGGLES.map(({ key, setter, label, icon }) => (
            <ToggleItem key={key} storeKey={key} setterKey={setter} label={label} icon={icon} />
          ))}
        </div>
      </div>
    </SettingRow>
  );
})

/* ── Mini layout preview ── */

const LayoutPreview = memo(function LayoutPreview(): React.JSX.Element {
  const hideSidebar = useSettingsStore((s) => s.libraryDFHideSidebar)
  const hideRightPanel = useSettingsStore((s) => s.libraryDFHideRightPanel)
  const hideActivityBar = useSettingsStore((s) => s.libraryDFHideActivityBar)
  const hideHeader = useSettingsStore((s) => s.libraryDFHideHeader)
  const hideBottomNav = useSettingsStore((s) => s.libraryDFHideBottomNav)

  return (
    <div className="w-[180px] h-[110px] rounded-xl border border-border/50 bg-card/80 overflow-hidden flex flex-col select-none shadow-sm">
      <div className="flex flex-1 min-h-0">
        {/* Activity bar */}
        <div
          className="shrink-0 bg-muted/40 border-r border-border/30 flex flex-col items-center pt-2 gap-1.5 transition-all duration-300 ease-in-out overflow-hidden"
          style={{ width: hideActivityBar ? 0 : 16, borderRightWidth: hideActivityBar ? 0 : 1, opacity: hideActivityBar ? 0 : 1 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 shrink-0" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 shrink-0" />
        </div>

        {/* Sidebar */}
        <div
          className="shrink-0 bg-muted/25 border-r border-border/30 flex flex-col py-1.5 px-1 gap-[3px] transition-all duration-300 ease-in-out overflow-hidden"
          style={{ width: hideSidebar ? 0 : 36, borderRightWidth: hideSidebar ? 0 : 1, padding: hideSidebar ? 0 : undefined, opacity: hideSidebar ? 0 : 1 }}
        >
          <div className="h-1 w-full rounded-full bg-muted-foreground/15 shrink-0" />
          <div className="h-1 w-3/4 rounded-full bg-muted-foreground/10 shrink-0" />
          <div className="h-1 w-5/6 rounded-full bg-primary/20 shrink-0" />
          <div className="h-1 w-2/3 rounded-full bg-muted-foreground/10 shrink-0" />
          <div className="h-1 w-4/5 rounded-full bg-muted-foreground/10 shrink-0" />
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <div
            className="shrink-0 border-b border-border/30 bg-muted/15 flex items-center px-1.5 gap-1 transition-all duration-300 ease-in-out overflow-hidden"
            style={{ height: hideHeader ? 0 : 14, borderBottomWidth: hideHeader ? 0 : 1, opacity: hideHeader ? 0 : 1 }}
          >
            <div className="w-1 h-1 rounded-full bg-primary/30 shrink-0" />
            <div className="h-[2px] w-6 rounded-full bg-muted-foreground/15 shrink-0" />
            <div className="flex-1" />
            <div className="h-[2px] w-2 rounded-full bg-muted-foreground/10 shrink-0" />
            <div className="h-[2px] w-2 rounded-full bg-muted-foreground/10 shrink-0" />
          </div>

          {/* Content */}
          <div className="flex-1 p-2.5 flex flex-col gap-[3px] justify-center items-center">
            <div className="h-[2px] w-11/12 rounded-full bg-muted-foreground/8" />
            <div className="h-[2px] w-8/12 rounded-full bg-muted-foreground/8" />
            <div className="h-[2px] w-10/12 rounded-full bg-muted-foreground/8" />
            <div className="h-[2px] w-7/12 rounded-full bg-muted-foreground/8" />
            <div className="h-[2px] w-9/12 rounded-full bg-muted-foreground/8" />
          </div>

          {/* Bottom nav */}
          <div
            className="shrink-0 border-t border-border/30 bg-muted/15 flex items-center justify-between px-1.5 transition-all duration-300 ease-in-out overflow-hidden"
            style={{ height: hideBottomNav ? 0 : 12, borderTopWidth: hideBottomNav ? 0 : 1, opacity: hideBottomNav ? 0 : 1 }}
          >
            <div className="h-[2px] w-4 rounded-full bg-muted-foreground/12 shrink-0" />
            <div className="h-[2px] w-4 rounded-full bg-muted-foreground/12 shrink-0" />
          </div>
        </div>

        {/* Right panel */}
        <div
          className="shrink-0 bg-muted/25 border-l border-border/30 flex flex-col py-1.5 px-1 gap-[3px] transition-all duration-300 ease-in-out overflow-hidden"
          style={{ width: hideRightPanel ? 0 : 30, borderLeftWidth: hideRightPanel ? 0 : 1, padding: hideRightPanel ? 0 : undefined, opacity: hideRightPanel ? 0 : 1 }}
        >
          <div className="h-1 w-full rounded-full bg-muted-foreground/15 shrink-0" />
          <div className="h-1 w-2/3 rounded-full bg-muted-foreground/10 shrink-0" />
          <div className="h-1 w-4/5 rounded-full bg-muted-foreground/10 shrink-0" />
        </div>
      </div>
    </div>
  )
})

/* ── Toggle item ── */

const ToggleItem = memo(function ToggleItem({
  storeKey,
  setterKey,
  label,
  icon: Icon,
}: {
  storeKey: ToggleKey
  setterKey: SetterKey
  label: string
  icon: IconType
}): React.JSX.Element {
  const value = useSettingsStore((s) => s[storeKey])
  const setter = useSettingsStore((s) => s[setterKey])

  return (
    <label className="flex items-center gap-2.5 px-3 py-2 bg-card hover:bg-secondary/40 cursor-pointer select-none transition-colors">
      <Icon size={13} className={`shrink-0 transition-colors ${value ? 'text-primary' : 'text-muted-foreground/50'}`} />
      <span className="text-[12px] text-foreground/80 flex-1 whitespace-nowrap">{label}</span>
      <Switch checked={value} onCheckedChange={setter} />
    </label>
  )
})
