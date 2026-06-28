import { memo } from 'react'
import { ButtonGroup } from '@/components/ui/button-group'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { ACTIVITY_BAR_OPTIONS, SIDEBAR_OPTIONS } from '../../Settings.constants'
import type { LayoutPreviewProps } from '../../Settings.types'

export const PanelLayoutSetting = memo(function PanelLayoutSetting(): React.JSX.Element {
  const activityBarPosition = useSettingsStore((s) => s.activityBarPosition)
  const setActivityBarPosition = useSettingsStore((s) => s.setActivityBarPosition)
  const sidebarPosition = useSettingsStore((s) => s.sidebarPosition)
  const setSidebarPosition = useSettingsStore((s) => s.setSidebarPosition)
  const showActivityBarLabels = useSettingsStore((s) => s.showActivityBarLabels)
  const setShowActivityBarLabels = useSettingsStore((s) => s.setShowActivityBarLabels)

  return (
    <div className="py-5">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground select-none">Panel layout order</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed select-none">
          Choose where the Activity Bar and Side Panel appear. Activity Bar can be placed on any
          edge. Side Panel sits left or right of the main content.
        </p>
      </div>

      <div className="flex items-start gap-10">
        <LayoutPreview activityBar={activityBarPosition} sidebar={sidebarPosition} />

        <div className="flex flex-col gap-4 flex-1">
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              Activity Bar
            </span>
            <ButtonGroup
              options={ACTIVITY_BAR_OPTIONS}
              value={activityBarPosition}
              onChange={setActivityBarPosition}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              Show Labels
            </span>
            <Switch
              checked={showActivityBarLabels}
              onCheckedChange={() => setShowActivityBarLabels(!showActivityBarLabels)}
            />
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="text-xs font-medium text-foreground whitespace-nowrap">
              Side Panel
            </span>
            <ButtonGroup
              options={SIDEBAR_OPTIONS}
              value={sidebarPosition}
              onChange={setSidebarPosition}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
})

const VERTICAL_LABEL_STYLE = { writingMode: 'vertical-lr' as const, textOrientation: 'mixed' as const }

function VerticalLabel({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span
      className={`text-[9px] font-medium leading-none tracking-wide ${className}`}
      style={VERTICAL_LABEL_STYLE}
    >
      {text}
    </span>
  )
}

const LayoutPreview = memo(function LayoutPreview({ activityBar, sidebar }: LayoutPreviewProps): React.JSX.Element {
  const isHorizontalAB = activityBar === 'top' || activityBar === 'bottom'

  const activityBarBlock = isHorizontalAB ? (
    <div className="w-full h-4 rounded-sm bg-primary/25 border border-primary/40 flex items-center justify-center">
      <span className="text-[8px] font-medium text-muted-foreground">Activity Bar</span>
    </div>
  ) : (
    <div className="w-4 h-full rounded-sm bg-primary/25 border border-primary/40 flex items-center justify-center">
      <VerticalLabel text="Activity Bar" className="text-muted-foreground" />
    </div>
  )

  const sidebarBlock = (
    <div className="w-7 h-full rounded-sm bg-info/25 border border-info/40 flex items-center justify-center shrink-0">
      <VerticalLabel text="Side Panel" className="text-muted-foreground" />
    </div>
  )

  const mainBlock = (
    <div className="flex-1 h-full rounded-sm bg-success/25 border border-success/40 flex items-center justify-center">
      <span className="text-[9px] font-medium text-muted-foreground">Main Content</span>
    </div>
  )

  const innerContent = (
    <div className="flex flex-1 gap-0.5 min-h-0 min-w-0">
      {sidebar === 'left' ? (
        <>
          {sidebarBlock}
          {mainBlock}
        </>
      ) : (
        <>
          {mainBlock}
          {sidebarBlock}
        </>
      )}
    </div>
  )

  const buildLayout = () => {
    if (activityBar === 'top') {
      return (
        <div className="flex flex-col gap-0.5 w-full h-full">
          {activityBarBlock}
          {innerContent}
        </div>
      )
    }
    if (activityBar === 'bottom') {
      return (
        <div className="flex flex-col gap-0.5 w-full h-full">
          {innerContent}
          {activityBarBlock}
        </div>
      )
    }
    if (activityBar === 'right') {
      return (
        <div className="flex gap-0.5 w-full h-full">
          {innerContent}
          {activityBarBlock}
        </div>
      )
    }
    return (
      <div className="flex gap-0.5 w-full h-full">
        {activityBarBlock}
        {innerContent}
      </div>
    )
  }

  return (
    <div className="w-52 h-24 rounded-lg border border-border bg-secondary/30 p-1.5">
      {buildLayout()}
    </div>
  )
})
