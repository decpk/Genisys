import { AppInlineLoader } from '@/components/AppLoader'

import { useMcpServersPanelData } from './useMcpServersPanelData'
import { styles } from './McpServersPanel.styles'
import { McpPanelHeader } from './components/McpPanelHeader'
import { McpEmptyState } from './components/McpEmptyState'
import { McpServerCard } from './components/McpServerCard'

export function McpServersPanel(): React.JSX.Element {
  const {
    servers,
    isLoading,
    expandedServer,
    toolsMap,
    loadingTools,
    connectingName,
    handleToggleExpand,
    handleConnect,
    handleDisconnect,
    total,
    connected,
    errored,
    totalTools,
  } = useMcpServersPanelData()

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <AppInlineLoader message="Loading servers..." size={14} className="text-xs" />
      </div>
    )
  }

  if (total === 0) {
    return <McpEmptyState />
  }

  return (
    <div className={styles.root}>
      <McpPanelHeader
        total={total}
        connected={connected}
        errored={errored}
        totalTools={totalTools}
      />
      <div className={styles.content}>
        <div className={styles.serverList}>
          {servers.map((server) => (
            <McpServerCard
              key={server.name}
              server={server}
              isExpanded={expandedServer === server.name}
              tools={toolsMap[server.name] ?? []}
              loadingTools={loadingTools}
              connectingName={connectingName}
              onToggleExpand={handleToggleExpand}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
