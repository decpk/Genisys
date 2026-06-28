import { Suspense } from 'react'

import { ResizablePanel } from '@/components/ResizablePanel'
import { AppLoader } from '@/components/AppLoader'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PanelHeading } from '@/components/ui/panel-heading'
import { SearchInput } from '@/components/ui/search-input'
import { SidebarLayout } from '@/components/ui/sidebar-layout'
import { Settings as SettingsIcon } from 'lucide-react'

import { SECTION_META } from './Settings.constants'
import { SettingsNavGroup } from './SettingsNavGroup'
import { SettingsSearchFuzzyToggle } from './components/SettingsSearchFuzzyToggle'
import { SettingsSectionShell } from './SettingsSectionShell'
import { SettingsSearchResults } from './SettingsSearchResults'
import { SettingsSearchContext } from './settings-search'
import { useSettingsData } from './useSettingsData'

export function Settings(): React.JSX.Element {
  const data = useSettingsData()
  const {
    activeSection,
    sidebarPosition,
    query,
    setQuery,
    search,
    handleSectionChange,
    navGroups,
    fuzzyEnabled,
    setFuzzyEnabled,
    searchContainerRef,
  } = data
  const { title } = SECTION_META[activeSection]

  const sidebar = (
    <ResizablePanel
      as="aside"
      defaultWidth={260}
      minWidth={200}
      maxWidth={400}
      position={sidebarPosition}
      className="sidebar-theme h-full bg-card"
      expandTitle="Expand settings"
      collapseTitle="Collapse settings"
    >
      <PanelHeading
        icon={SettingsIcon}
        title="Settings"
        className="px-3 h-12 border-b border-border/40"
      />

      <div ref={searchContainerRef} className="px-2 pt-2 pb-1">
        <SearchInput
          placeholder="Search settings…"
          value={query}
          onChange={setQuery}
          rightSlot={
            <SettingsSearchFuzzyToggle fuzzyEnabled={fuzzyEnabled} onToggle={setFuzzyEnabled} />
          }
        />
      </div>

      <nav className="flex flex-col gap-0.5 px-1.5 pt-0 pb-2">
        {navGroups.map((group) => (
          <SettingsNavGroup
            key={group.label}
            group={group}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        ))}
      </nav>
    </ResizablePanel>
  )

  let mainBody: React.ReactNode = <SettingsSectionShell section={activeSection} />
  if (search.isActive) {
    mainBody = <SettingsSearchResults result={search} onNavigate={handleSectionChange} />
  }

  const mainContent = (
    <div className="relative h-full overflow-y-auto p-8">
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <AppLoader />
          </div>
        }
      >
        <ErrorBoundary componentName={`Settings — ${title}`}>{mainBody}</ErrorBoundary>
      </Suspense>
    </div>
  )

  return (
    <SettingsSearchContext.Provider value={search.contextValue}>
      <SidebarLayout sidebarPosition={sidebarPosition} sidebar={sidebar}>
        {mainContent}
      </SidebarLayout>
    </SettingsSearchContext.Provider>
  )
}
