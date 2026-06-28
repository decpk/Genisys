export interface McpPreset {
  name: string;
  label: string;
  description: string;
  command: string;
  args: string[];
  category: string;
  envHint: string[];
  argsHint: string[];
}

export async function fetchMcpPresets(): Promise<McpPreset[]> {
  const result = await window.api.mcpGetPresets();
  return Array.isArray(result) ? result : [];
}
