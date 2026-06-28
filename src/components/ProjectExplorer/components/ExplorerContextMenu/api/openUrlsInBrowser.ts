import tauriApi from "@/tauri-api-bridge";

/** Open the given URLs in `browserAppName` (an `open -a` name) or the default browser. */
export async function openUrlsInBrowser(
  urls: string[],
  browserAppName?: string,
): Promise<number> {
  const result = await tauriApi.openUrlsInBrowser(urls, browserAppName);
  if (result.success) return result.opened;
  throw new Error(result.error || "Failed to open URLs.");
}
