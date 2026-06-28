import { Play, Square, Copy, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { PortInput } from './PortInput'
import { useServerConfigPanelData } from './useServerConfigPanelData'
import * as styles from './ServerConfigPanel.styles'

export function ServerConfigPanel() {
  const {
    server,
    name,
    setName,
    port,
    setPort,
    portAvailable,
    isCheckingPort,
    isRunning,
    baseUrl,
    projects,
    selectedProjectId,
    handleNameBlur,
    handlePortBlur,
    handleToggleServer,
    handleProjectChange,
    handleCopyBaseUrl,
  } = useServerConfigPanelData()

  if (!server) return null

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const projectItems: DropdownItem[] = projects.map((p) => ({
    key: p.id,
    label: p.name,
    active: p.id === selectedProjectId,
    prefix: <span className={styles.projectItemDot} style={{ backgroundColor: p.color }} />,
    onSelect: () => handleProjectChange(p.id),
  }))

  const statusPillClass = cn(
    styles.statusPillBase,
    isRunning ? styles.statusPillRunning : styles.statusPillStopped
  )
  const statusDotClass = cn(
    styles.statusDotBase,
    isRunning ? styles.statusDotRunning : styles.statusDotStopped
  )
  const statusLabel = isRunning ? 'Running' : 'Stopped'

  const toggleVariant = isRunning ? 'destructive' : 'success'
  const ToggleIcon = isRunning ? Square : Play
  const toggleLabel = isRunning ? 'Stop' : 'Start'

  const projectLabelText = selectedProject?.name ?? 'Project'

  return (
    <div className={styles.container}>
      {/* Server name (inline editable) */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleNameBlur}
        className={styles.nameInput}
        style={{ minWidth: '80px', width: `${Math.max(name.length, 6)}ch` }}
      />

      {/* Status pill */}
      <span className={statusPillClass}>
        <span className={statusDotClass} />
        {statusLabel}
      </span>

      {/* Separator */}
      <div className={styles.separator} />

      {/* Port (compact) */}
      <div className={styles.portGroup}>
        <span className={styles.portLabel}>Port</span>
        <PortInput
          port={port}
          onPortChange={setPort}
          onBlur={handlePortBlur}
          portAvailable={portAvailable}
          isChecking={isCheckingPort}
          disabled={isRunning}
        />
      </div>

      {/* Project selector (compact) */}
      <div className={styles.projectGroup}>
        <span className={styles.projectLabel}>Project</span>
        <Dropdown
          items={projectItems}
          openOn="click"
          align="left"
          showCheck
          menuWidth="180px"
          trigger={
            <button className={styles.projectTrigger}>
              {selectedProject && (
                <span
                  className={styles.projectDot}
                  style={{ backgroundColor: selectedProject.color }}
                />
              )}
              <span className={styles.projectName}>{projectLabelText}</span>
              <ChevronDown size={10} className={styles.projectChevron} />
            </button>
          }
        />
      </div>

      {/* Base URL + copy */}
      <div className={styles.baseUrlGroup}>
        <span className={styles.baseUrlChip}>{baseUrl}</span>
        <IconButton
          variant="ghost"
          size="xs"
          tooltip="Copy base URL"
          onClick={handleCopyBaseUrl}
        >
          <Copy className={styles.copyIcon} />
        </IconButton>
      </div>

      {/* Separator before primary action */}
      <div className={styles.toggleSeparator} />

      {/* Start/Stop button */}
      <Button onClick={handleToggleServer} variant={toggleVariant} size="sm">
        <ToggleIcon className={styles.toggleIcon} />
        {toggleLabel}
      </Button>
    </div>
  )
}
