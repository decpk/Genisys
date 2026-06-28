/**
 * Shared payload shape for the Rust FS watcher's `fs-change` Tauri event.
 *
 * The Rust side (`fs_watcher` command module) debounces, gitignore-filters and
 * suppresses self-writes before emitting `fs-change`. Consumers listen via
 * `listen<FsChangeEventPayload>('fs-change', ...)`.
 */
export type FsChangeKind = 'workdir' | 'index' | 'head' | 'refs' | 'merge'

export interface FsChangeEventPayload {
  rootPath: string
  kind: FsChangeKind
  changedPaths: string[]
}
