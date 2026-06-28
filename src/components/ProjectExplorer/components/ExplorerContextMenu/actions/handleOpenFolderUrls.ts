import type { BrowserApp } from "@/tauri-api-bridge";
import { scopedToast } from "@/frameworks/notification";

import { collectFolderUrls } from "../api/collectFolderUrls";
import { openUrlsInBrowser } from "../api/openUrlsInBrowser";

const toast = scopedToast("explorer");

/**
 * Scan every file in `folderRelPath` (relative to `rootPath`) for URLs and open
 * them all in `browser` (or the system default when omitted).
 */
export async function handleOpenFolderUrls(
  rootPath: string,
  folderRelPath: string,
  browser?: BrowserApp,
): Promise<void> {
  const target = browser?.name ?? "default browser";
  const toastId = toast.loading("Scanning folder for URLs…");

  try {
    const urls = await collectFolderUrls(rootPath, folderRelPath);
    if (urls.length === 0) {
      toast.info("No URLs found in this folder.", { id: toastId });
      return;
    }
    const opened = await openUrlsInBrowser(urls, browser?.appName);
    const noun = opened === 1 ? "URL" : "URLs";
    toast.success(`Opened ${opened} ${noun} in ${target}`, { id: toastId });
  } catch (error) {
    const err = error as Error;
    const details = err?.message ? `: ${err.message}` : "";
    toast.error(`Failed to open URLs${details}`, { id: toastId });
  }
}
