import { memo } from 'react'
import {
  Plus,
  Trash2,
  Plug,
  PlugZap,
  Package,
  Download,
  Check,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { AppLoaderGlyph, AppInlineLoader } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'
import { useMcpServersSettingData } from './useMcpServersSettingData'
import { styles } from './McpServersSetting.styles'
import type { McpConnectionStatus } from './McpServersSetting.types'

export const McpServersSetting = memo(function McpServersSetting(): React.JSX.Element {
  const {
    servers,
    loading,
    showForm,
    form,
    saving,
    view,
    presets,
    discovered,
    importing,
    addingPreset,
    serverNames,
    handleAdd,
    handleRemove,
    handleConnect,
    handleConnectAll,
    handleDisconnect,
    connectingServer,
    connectingAll,
    expandedServer,
    serverTools,
    loadingTools,
    handleToggleServer,
    handleToggleForm,
    updateFormField,
    handleShowPresets,
    handleAddPreset,
    handleShowImport,
    handleImportServer,
    setView,
  } = useMcpServersSettingData();

  if (loading) {
    return (
      <div className={styles.container}>
        <AppInlineLoader message="Loading MCP servers..." size={14} className="text-xs" />
      </div>
    );
  }

  // ── Presets View ───────────────────────────────────────
  if (view === "presets") {
    const communityPresets = presets.filter((p) => p.category === "community");

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("servers")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back to servers
          </Button>
        </div>

        {communityPresets.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground mb-2 mt-4">
              Community / Public
            </p>
            <div className={styles.serverList}>
              {communityPresets.map((preset) => {
                const alreadyAdded = serverNames.has(preset.name);
                const isAdding = addingPreset === preset.name;
                const hasEnvHint = preset.envHint.length > 0;
                return (
                  <div key={preset.name} className={styles.serverCard}>
                    <div className={styles.serverInfo}>
                      <Package
                        size={14}
                        className="shrink-0 text-emerald-400"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={styles.serverName}>{preset.label}</p>
                        <p className={styles.serverMeta}>
                          {preset.description}
                          {hasEnvHint && (
                            <span className="text-amber-400">
                              {" "}
                              · Needs: {preset.envHint.join(", ")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={alreadyAdded ? "success" : "default"}
                      size="xs"
                      onClick={() => handleAddPreset(preset)}
                      disabled={alreadyAdded || isAdding}
                    >
                      {alreadyAdded ? (
                        <span className="flex items-center gap-1">
                          <Check size={12} /> Added
                        </span>
                      ) : isAdding ? (
                        <AppLoaderGlyph size={12} />
                      ) : (
                        "Add"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Import View ────────────────────────────────────────
  if (view === "import") {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("servers")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back to servers
          </Button>
        </div>

        {importing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
            <AppInlineLoader message="Scanning VS Code configs for MCP servers..." size={14} className="text-xs" />
          </div>
        )}

        {!importing && discovered.length === 0 && (
          <p className={styles.emptyState}>
            No MCP servers found in VS Code configs.
          </p>
        )}

        {!importing && discovered.length > 0 && (
          <div className={styles.serverList}>
            {discovered.map((server) => {
              const alreadyAdded = serverNames.has(server.name);
              const isAdding = addingPreset === server.name;
              const sourceLabel = `from ~/${server.source}`;
              return (
                <div
                  key={`${server.name}-${server.source}`}
                  className={styles.serverCard}
                >
                  <div className={styles.serverInfo}>
                    <Download size={14} className="shrink-0 text-blue-400" />
                    <div className="min-w-0 flex-1">
                      <p className={styles.serverName}>{server.name}</p>
                      <p className={styles.serverMeta}>
                        {server.command} {server.args.join(" ")}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {sourceLabel}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={alreadyAdded ? "success" : "default"}
                    size="xs"
                    onClick={() => handleImportServer(server)}
                    disabled={alreadyAdded || isAdding}
                  >
                    {alreadyAdded ? (
                      <span className="flex items-center gap-1">
                        <Check size={12} /> Added
                      </span>
                    ) : isAdding ? (
                      <AppLoaderGlyph size={12} />
                    ) : (
                      "Import"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Servers View (default) ─────────────────────────────
  const hasServers = servers.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>MCP Servers</p>
          <p className={styles.description}>
            Connect to Model Context Protocol servers for external tools
            (GitHub, filesystem, web fetch, etc.)
          </p>
        </div>
        <div className="flex items-center gap-1">
          {servers.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleConnectAll}
              disabled={connectingAll}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {connectingAll ? <AppLoaderGlyph size={12} /> : <Plug size={12} />}
              {connectingAll ? "Connecting\u2026" : "Connect all"}
            </Button>
          )}
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="Import"
            onClick={handleShowImport}
          >
            <Download size={16} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            tooltip="Browse presets"
            onClick={handleShowPresets}
          >
            <Package size={16} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            tooltip={showForm ? "Cancel" : "Add server"}
            onClick={handleToggleForm}
          >
            <Plus
              size={16}
              className={cn(showForm && "rotate-45", "transition-transform")}
            />
          </IconButton>
        </div>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Name</label>
            <input
              className={styles.formInput}
              placeholder="e.g. github"
              value={form.name}
              onChange={(e) => updateFormField("name", e.target.value)}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Command</label>
            <input
              className={styles.formInput}
              placeholder="e.g. npx"
              value={form.command}
              onChange={(e) => updateFormField("command", e.target.value)}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Arguments (space-separated)
            </label>
            <input
              className={styles.formInput}
              placeholder="e.g. -y @modelcontextprotocol/server-github"
              value={form.args}
              onChange={(e) => updateFormField("args", e.target.value)}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>
              Environment variables (KEY=VALUE, one per line)
            </label>
            <textarea
              className={styles.formTextarea}
              rows={3}
              placeholder={"GITHUB_TOKEN=ghp_...\nANOTHER_VAR=value"}
              value={form.env}
              onChange={(e) => updateFormField("env", e.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button
              onClick={handleAdd}
              disabled={saving || !form.name.trim() || !form.command.trim()}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Adding..." : "Add Server"}
            </button>
            <button
              onClick={handleToggleForm}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!hasServers && !showForm && (
        <p className={styles.emptyState}>
          No MCP servers configured. Use presets or import from VS Code
          to get started.
        </p>
      )}

      {hasServers && (
        <div className={styles.serverList}>
          {servers.map((server) => {
            const isConnecting = connectingServer === server.name;
            const statusDot = isConnecting
              ? styles.statusDot.connecting
              : (styles.statusDot[server.status as McpConnectionStatus] ??
                styles.statusDot.disconnected);
            const isConnected = server.status === "connected";
            const toolLabel =
              server.toolCount === 1 ? "1 tool" : `${server.toolCount} tools`;
            const isExpanded = expandedServer === server.name;
            const tools = serverTools[server.name] ?? [];

            return (
              <div key={server.name}>
                <div className={styles.serverCard}>
                  <div
                    className={cn(styles.serverInfo, isConnected && 'cursor-pointer')}
                    onClick={() => isConnected && handleToggleServer(server.name)}
                  >
                    {isConnected && (
                      <ChevronRight
                        size={12}
                        className={cn(
                          'shrink-0 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-90',
                        )}
                      />
                    )}
                    <div className={statusDot} />
                    <div className="min-w-0 flex-1">
                      <p className={styles.serverName}>{server.name}</p>
                      <p className={styles.serverMeta}>
                        {isConnecting
                          ? "Connecting\u2026"
                          : isConnected
                            ? `${server.serverInfo?.name ?? "Connected"} · ${toolLabel}`
                            : (server.error ?? server.status)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    {isConnected ? (
                      <IconButton
                        variant="ghost"
                        size="sm"
                        tooltip="Disconnect"
                        onClick={() => handleDisconnect(server.name)}
                      >
                        <PlugZap size={14} />
                      </IconButton>
                    ) : connectingServer === server.name ? (
                      <span className="p-1.5">
                        <AppLoaderGlyph size={14} />
                      </span>
                    ) : (
                      <IconButton
                        variant="ghost"
                        size="sm"
                        tooltip="Connect"
                        onClick={() => handleConnect(server.name)}
                      >
                        <Plug size={14} />
                      </IconButton>
                    )}
                    <IconButton
                      variant="destructive"
                      size="sm"
                      tooltip="Remove"
                      onClick={() => handleRemove(server.name)}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>
                {isExpanded && (
                  <McpToolList tools={tools} loading={loadingTools} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
})

// ── Tool list sub-component ──────────────────────────────

interface McpToolItem {
  name: string
  description: string
}

function McpToolList({ tools, loading }: { tools: McpToolItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="py-3 px-3">
        <AppInlineLoader message="Loading tools..." size={12} className="text-[11px]" />
      </div>
    )
  }

  if (tools.length === 0) {
    return <p className="text-[11px] text-muted-foreground py-3 px-3">No tools available</p>
  }

  return (
    <div className="mt-1 mb-2 rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
        {tools.length} tools
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        {tools.map((tool, i) => (
          <div
            key={tool.name}
            className={cn(
              "group grid grid-cols-[300px_1fr] gap-x-4 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors",
              i % 2 === 1 && "bg-muted/30",
            )}
          >
            <Tooltip content={tool.name} side="top">
              <span className="text-[11px] font-medium text-foreground truncate">
                {tool.name}
              </span>
            </Tooltip>
            <span className="text-[10px] text-muted-foreground leading-snug">
              {tool.description || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
