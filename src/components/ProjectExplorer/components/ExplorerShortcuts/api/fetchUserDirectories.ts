import type { UserDirectories } from "@/tauri-api-bridge";

/**
 * Wrapper around the global `window.api.getUserDirectories()` bridge call.
 * Kept in its own file per the API/Fetch segregation rule so the call site
 * can be mocked in tests and so the component only has one concern.
 */
export async function fetchUserDirectories(): Promise<UserDirectories> {
  return window.api.getUserDirectories();
}
