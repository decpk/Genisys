import tauriApi from "@/tauri-api-bridge";

/** Scan a folder (repo-relative) for URLs in its files' contents. */
export async function collectFolderUrls(
  rootPath: string,
  folderPath: string,
): Promise<string[]> {
  const result = await tauriApi.collectFolderUrls(rootPath, folderPath);
  if (result.success && Array.isArray(result.urls)) return result.urls;
  throw new Error(result.error || "Failed to scan folder for URLs.");
}
