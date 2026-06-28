import { memo } from "react";

import { Main } from "@/components/Main";
import { SettingsFloatingWindow } from "@/components/Settings/SettingsFloatingWindow";

import { AppDropZones } from "../AppDropZones";
import {
  Dashboard,
  Settings,
  Autoflow,
  Webpoint,
  Chat,
  Library,
  APIClient,
  WebLinks,
  NotesApp,
  MockServer,
  ProjectExplorer,
  DebugPanel,
  DailyPlan,
  ClipboardManager,
  Timer,
  TerminalApp,
  Monitor,
  QuickShare,
  AppStore,
  PromptsApp,
  Messages,
} from "@/App.constants";

import { AppPane } from "./AppPane";
import type { GenisysMainContentProps } from "../../GenisysApp.types";

export const GenisysMainContent = memo(function GenisysMainContent({
  activeApp,
  activated,
  onOpenSettingsApp,
}: GenisysMainContentProps): React.JSX.Element {
  return (
    <Main>
      {activated["dashboard"] && (
        <AppPane
          appId="dashboard"
          activeApp={activeApp}
          activeClassName="h-full flex flex-col"
          componentName="Dashboard"
          fallback="app"
        >
          <Dashboard />
        </AppPane>
      )}
      {activated["settings"] && (
        <AppPane
          appId="settings"
          activeApp={activeApp}
          activeClassName="h-full"
          componentName="Settings"
          fallback="app"
        >
          <Settings />
        </AppPane>
      )}
      {activated["explorer"] && (
        <AppPane
          appId="explorer"
          activeApp={activeApp}
          activeClassName="h-full"
          componentName="Project Explorer"
        >
          <ProjectExplorer />
        </AppPane>
      )}
      {activated["autoflow"] && (
        <AppPane
          appId="autoflow"
          activeApp={activeApp}
          activeClassName="h-full"
          componentName="Autoflow"
        >
          <Autoflow />
        </AppPane>
      )}
      {activated["webpoint"] && (
        <AppPane
          appId="webpoint"
          activeApp={activeApp}
          activeClassName="h-full"
          componentName="WebPoint"
        >
          <Webpoint />
        </AppPane>
      )}
      {activated["chat"] && (
        <AppPane
          appId="chat"
          activeApp={activeApp}
          activeClassName="h-full"
          componentName="Chat"
        >
          <Chat />
        </AppPane>
      )}
      {activated["messages"] && (
        <AppPane
          appId="messages"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Messages"
        >
          <Messages />
        </AppPane>
      )}
      {activated["library"] && (
        <AppPane
          appId="library"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Library"
        >
          <Library />
        </AppPane>
      )}
      {activated["apiclient"] && (
        <AppPane
          appId="apiclient"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="API Client"
        >
          <APIClient />
        </AppPane>
      )}
      {activated["weblinks"] && (
        <AppPane
          appId="weblinks"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="WebLinks"
        >
          <WebLinks />
        </AppPane>
      )}
      {activated["notes"] && (
        <AppPane
          appId="notes"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Notes"
        >
          <NotesApp />
        </AppPane>
      )}
      {activated["prompts"] && (
        <AppPane
          appId="prompts"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Prompts"
        >
          <PromptsApp />
        </AppPane>
      )}
      {activated["mockserver"] && (
        <AppPane
          appId="mockserver"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Mock Server"
        >
          <MockServer />
        </AppPane>
      )}
      {activated["dailyplan"] && (
        <AppPane
          appId="dailyplan"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Daily Plan"
        >
          <DailyPlan />
        </AppPane>
      )}
      {activated["clipboard"] && (
        <AppPane
          appId="clipboard"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Clipboard Manager"
        >
          <ClipboardManager />
        </AppPane>
      )}
      {activated["timer"] && (
        <AppPane
          appId="timer"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Timer"
        >
          <Timer />
        </AppPane>
      )}
      {activated["terminal"] && (
        <AppPane
          appId="terminal"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Terminal"
        >
          <TerminalApp />
        </AppPane>
      )}
      {activated["monitor"] && (
        <AppPane
          appId="monitor"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="Monitor"
        >
          <Monitor />
        </AppPane>
      )}
      {activated["quickshare"] && (
        <AppPane
          appId="quickshare"
          activeApp={activeApp}
          activeClassName="h-full overflow-hidden"
          componentName="QuickShare"
        >
          <QuickShare />
        </AppPane>
      )}
      {activated["appstore"] && (
        <AppPane
          appId="appstore"
          activeApp={activeApp}
          activeClassName="h-full flex flex-col overflow-hidden"
          componentName="App Store"
        >
          <AppStore />
        </AppPane>
      )}
      {activated["storeinspector"] && (
        <AppPane
          appId="storeinspector"
          activeApp={activeApp}
          activeClassName="h-full"
          componentName="Debug Panel"
          fallback="app"
        >
          <DebugPanel defaultTab="store" />
        </AppPane>
      )}
      {activated["debug"] && (
        <AppPane
          appId="debug"
          activeApp={activeApp}
          activeClassName="h-full"
          componentName="Debug Panel"
          fallback="app"
        >
          <DebugPanel />
        </AppPane>
      )}
      {activated["aiinspector"] && (
        <AppPane
          appId="aiinspector"
          activeApp={activeApp}
          activeClassName="h-full"
          componentName="Debug Panel"
          fallback="app"
        >
          <DebugPanel defaultTab="ai" />
        </AppPane>
      )}
      <SettingsFloatingWindow
        activeApp={activeApp}
        onOpenFullApp={onOpenSettingsApp}
      />
      <AppDropZones />
      </Main>
  );
});
