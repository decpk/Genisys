export type AppView = 'dashboard' | 'explorer' | 'autoflow' | 'webpoint' | 'chat' | 'library' | 'apiclient' | 'notes' | 'mockserver' | 'dailyplan' | 'clipboard' | 'timer' | 'terminal' | 'monitor' | 'quickshare' | 'appstore' | 'prompts' | 'messages' | 'weblinks' | 'storeinspector' | 'aiinspector' | 'debug' | 'settings'

export interface ActivityBarProps {
  activeApp: AppView
  onActiveAppChange: (mode: AppView) => void
  activated?: Record<AppView, boolean>
  onDeactivateApp?: (app: AppView) => void
  visibleApps?: AppView[]
}
