export interface DiscoveredMcpServer {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  transport: string;
  source: string;
}

export async function importFromVscode(): Promise<DiscoveredMcpServer[]> {
  const result = await window.api.mcpImportVscode();
  return Array.isArray(result) ? result : [];
}
