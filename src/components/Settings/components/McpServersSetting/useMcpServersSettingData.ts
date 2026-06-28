import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  McpServerSummary,
  McpServerFormData,
  McpSettingsView,
} from "./McpServersSetting.types";
import type { McpPreset } from "./api/fetchMcpPresets";
import type { DiscoveredMcpServer } from "./api/importFromVscode";
import { fetchMcpServers } from './api/fetchMcpServers'
import { addMcpServer } from './api/addMcpServer'
import { removeMcpServer } from './api/removeMcpServer'
import { connectMcpServer } from './api/connectMcpServer'
import { disconnectMcpServer } from './api/disconnectMcpServer'
import { fetchMcpPresets } from "./api/fetchMcpPresets";
import { importFromVscode } from "./api/importFromVscode";

const EMPTY_FORM: McpServerFormData = {
  name: '',
  command: '',
  args: '',
  env: '',
  enabled: true,
}

export function useMcpServersSettingData() {
  const [servers, setServers] = useState<McpServerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<McpServerFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<McpSettingsView>("servers");
  const [presets, setPresets] = useState<McpPreset[]>([]);
  const [discovered, setDiscovered] = useState<DiscoveredMcpServer[]>([]);
  const [importing, setImporting] = useState(false);
  const [addingPreset, setAddingPreset] = useState<string | null>(null);
  const [connectingServer, setConnectingServer] = useState<string | null>(null);
  const [connectingAll, setConnectingAll] = useState(false);
  const [expandedServer, setExpandedServer] = useState<string | null>(null);
  const [loadingTools, setLoadingTools] = useState(false);
  const serverToolsRef = useRef<Record<string, { name: string; description: string }[]>>({});
  const [serverTools, setServerTools] = useState<Record<string, { name: string; description: string }[]>>({});

  const serverNames = new Set(servers.map((s) => s.name));

  const loadServers = useCallback(async () => {
    try {
      const result = await fetchMcpServers();
      setServers(result);
    } catch {
      // silently fail — no servers configured yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServers();
  }, [loadServers]);

  const handleAdd = useCallback(async () => {
    if (!form.name.trim() || !form.command.trim()) return;
    setSaving(true);
    try {
      const result = await addMcpServer(form);
      setServers(result);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      console.error("[MCP] Failed to add server:", err);
    } finally {
      setSaving(false);
    }
  }, [form]);

  const handleRemove = useCallback(async (name: string) => {
    try {
      const result = await removeMcpServer(name);
      setServers(result);
    } catch (err) {
      console.error("[MCP] Failed to remove server:", err);
    }
  }, []);

  const clearToolCache = useCallback(() => {
    serverToolsRef.current = {};
    setServerTools({});
    setExpandedServer(null);
  }, []);

  const handleConnect = useCallback(async (name: string) => {
    setConnectingServer(name);
    try {
      const result = await connectMcpServer(name);
      setServers(result);
      clearToolCache();
    } catch (err) {
      console.error("[MCP] Failed to connect server:", err);
    } finally {
      setConnectingServer(null);
    }
  }, [clearToolCache]);

  const handleConnectAll = useCallback(async () => {
    setConnectingAll(true);
    try {
      // Connect servers one at a time so the UI can show which one is in
      // progress (the active row gets a spinner + "Connecting…"), and rows
      // flip to connected live as each finishes.
      const list = await fetchMcpServers();
      setServers(list);
      for (const server of list) {
        if (server.status === "connected") continue;
        setConnectingServer(server.name);
        // One retry to ride out transient/flaky connects.
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const updated = await connectMcpServer(server.name);
            setServers(updated);
            break;
          } catch (err) {
            if (attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 800));
              continue;
            }
            console.error(`[MCP] Failed to connect '${server.name}':`, err);
          }
        }
      }
      // Final refresh so any failed servers reflect their error status.
      const refreshed = await fetchMcpServers();
      setServers(refreshed);
      clearToolCache();
    } catch (err) {
      console.error("[MCP] Failed to connect all servers:", err);
    } finally {
      setConnectingServer(null);
      setConnectingAll(false);
    }
  }, [clearToolCache]);

  const handleDisconnect = useCallback(async (name: string) => {
    try {
      const result = await disconnectMcpServer(name);
      setServers(result);
      clearToolCache();
    } catch (err) {
      console.error("[MCP] Failed to disconnect server:", err);
    }
  }, [clearToolCache]);

  const handleToggleServer = useCallback(async (name: string) => {
    if (expandedServer === name) {
      setExpandedServer(null);
      return;
    }
    setExpandedServer(name);

    // Use cached tools if available
    if (serverToolsRef.current[name]) return;

    setLoadingTools(true);
    try {
      const { tools } = await window.api.mcpListTools();
      const grouped: Record<string, { name: string; description: string }[]> = {};
      for (const tool of tools) {
        const fn = tool.function;
        if (!fn?.name) continue;
        const prefixed: string = fn.name;
        if (!prefixed.startsWith('mcp__')) continue;
        const rest = prefixed.slice(5);
        const sepIdx = rest.indexOf('__');
        if (sepIdx < 0) continue;
        const serverName = rest.slice(0, sepIdx);
        const toolName = rest.slice(sepIdx + 2);
        if (!grouped[serverName]) grouped[serverName] = [];
        grouped[serverName].push({ name: toolName, description: fn.description ?? '' });
      }
      serverToolsRef.current = grouped;
      setServerTools(grouped);
    } catch (err) {
      console.error('[MCP] Failed to list tools:', err);
    } finally {
      setLoadingTools(false);
    }
  }, [expandedServer]);

  const handleToggleForm = useCallback(() => {
    setShowForm((prev) => !prev);
    if (showForm) setForm(EMPTY_FORM);
  }, [showForm]);

  const updateFormField = useCallback(
    <K extends keyof McpServerFormData>(
      field: K,
      value: McpServerFormData[K],
    ) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // ── Presets ────────────────────────────────────────────

  const handleShowPresets = useCallback(async () => {
    setView("presets");
    if (presets.length === 0) {
      const result = await fetchMcpPresets();
      setPresets(result);
    }
  }, [presets.length]);

  const handleAddPreset = useCallback(async (preset: McpPreset) => {
    const needsUserInput = preset.argsHint.length > 0 || preset.envHint.length > 0

    // If preset needs user input (org, project, tokens), pre-fill the manual form
    if (needsUserInput) {
      const allArgs = [...preset.args, ...preset.argsHint].join(" ");
      const envLines = preset.envHint.map((k) => `${k}=`).join("\n");
      setForm({
        name: preset.name,
        command: preset.command,
        args: allArgs,
        env: envLines,
        enabled: true,
      });
      setShowForm(true);
      setView("servers");
      return;
    }

    // No user input needed — add directly
    setAddingPreset(preset.name);
    try {
      const result = await addMcpServer({
        name: preset.name,
        command: preset.command,
        args: preset.args.join(" "),
        env: "",
        enabled: true,
      });
      setServers(result);
    } catch (err) {
      console.error("[MCP] Failed to add preset:", err);
    } finally {
      setAddingPreset(null);
    }
  }, []);

  // ── Import from VS Code ───────────────────────────────

  const handleShowImport = useCallback(async () => {
    setView("import");
    setImporting(true);
    try {
      const result = await importFromVscode();
      setDiscovered(result);
    } catch (err) {
      console.error("[MCP] Import scan failed:", err);
    } finally {
      setImporting(false);
    }
  }, []);

  const handleImportServer = useCallback(
    async (server: DiscoveredMcpServer) => {
      setAddingPreset(server.name);
      try {
        const envLines = Object.entries(server.env)
          .map(([k, v]) => `${k}=${v}`)
          .join("\n");
        const result = await addMcpServer({
          name: server.name,
          command: server.command,
          args: server.args.join(" "),
          env: envLines,
          enabled: true,
        });
        setServers(result);
      } catch (err) {
        console.error("[MCP] Failed to import server:", err);
      } finally {
        setAddingPreset(null);
      }
    },
    [],
  );

  return {
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
    connectingServer,
    connectingAll,
    expandedServer,
    serverTools,
    loadingTools,
    handleToggleServer,
    handleAdd,
    handleRemove,
    handleConnect,
    handleConnectAll,
    handleDisconnect,
    handleToggleForm,
    updateFormField,
    handleShowPresets,
    handleAddPreset,
    handleShowImport,
    handleImportServer,
    setView,
  };
}
