import { lazy } from 'react'

export const Dashboard = lazy(() =>
  import('@/components/Dashboard/Dashboard').then((m) => ({ default: m.Dashboard }))
)

export const Settings = lazy(() =>
  import('@/components/Settings/Settings').then((m) => ({ default: m.Settings }))
)

export const Autoflow = lazy(() =>
  import('@/components/Autoflow/Autoflow').then((m) => ({ default: m.Autoflow }))
)

export const Webpoint = lazy(() =>
  import('@/components/Webpoint/Webpoint').then((m) => ({ default: m.Webpoint }))
)

export const Chat = lazy(() => import('@/components/Chat/Chat').then((m) => ({ default: m.Chat })))

export const ProjectExplorer = lazy(() =>
  import('@/components/ProjectExplorer/ProjectExplorer').then((m) => ({
    default: m.ProjectExplorer
  }))
)

export const Library = lazy(() =>
  import('@/components/Library/Library').then((m) => ({
    default: m.Library
  }))
)

export const StoreInspector = lazy(() =>
  import('@/components/StoreInspector/StoreInspector').then((m) => ({
    default: m.StoreInspector
  }))
)

export const DebugPanel = lazy(() =>
  import('@/components/DebugPanel/DebugPanel').then((m) => ({
    default: m.DebugPanel
  }))
)

export const AIInspector = lazy(() =>
  import('@/components/AIInspector/AIInspector').then((m) => ({
    default: m.AIInspector
  }))
)

export const APIClient = lazy(() =>
  import('@/components/APIClient/APIClient').then((m) => ({ default: m.APIClient }))
)

export const WebLinks = lazy(() =>
  import('@/components/WebLinks/WebLinks').then((m) => ({ default: m.WebLinks }))
)

export const NotesApp = lazy(() =>
  import('@/components/NotesApp/NotesApp').then((m) => ({
    default: m.NotesApp
  }))
)

export const MockServer = lazy(() =>
  import('@/components/MockServer/MockServer').then((m) => ({
    default: m.MockServer
  }))
)

export const DebugPanelApp = lazy(() =>
  import('@/components/DebugPanelApp/DebugPanelApp').then((m) => ({
    default: m.DebugPanelApp
  }))
)

export const DailyPlan = lazy(() =>
  import('@/components/DailyPlan/DailyPlan').then((m) => ({
    default: m.DailyPlan
  }))
)

export const ClipboardManager = lazy(() =>
  import('@/components/ClipboardManager/ClipboardManager').then((m) => ({
    default: m.ClipboardManager
  }))
)

export const Timer = lazy(() =>
  import('@/components/Timer/Timer').then((m) => ({ default: m.Timer }))
)

export const AppStore = lazy(() =>
  import('@/components/AppStore/AppStore').then((m) => ({ default: m.AppStore }))
)

export const PromptsApp = lazy(() =>
  import('@/components/PromptsApp/PromptsApp').then((m) => ({ default: m.PromptsApp }))
)

export const Messages = lazy(() =>
  import('@/components/Messages/Messages').then((m) => ({ default: m.Messages }))
)

export const TerminalApp = lazy(() =>
  import('@/components/TerminalApp/TerminalApp').then((m) => ({ default: m.TerminalApp }))
)

export const Monitor = lazy(() =>
  import('@/components/Monitor').then((m) => ({ default: m.Monitor }))
)

export const QuickShare = lazy(() =>
  import('@/components/QuickShare').then((m) => ({ default: m.QuickShare }))
)
