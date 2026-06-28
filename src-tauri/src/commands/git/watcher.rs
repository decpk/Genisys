// Backward-compat shim. The watcher implementation now lives in
// `commands::fs_watcher`. Git writers that call `mark_self_write` keep
// importing it from here to avoid touching every callsite.
//
// The legacy `cmd_git_start_watching` / `cmd_git_stop_watching` Tauri
// commands have been replaced by `cmd_fs_start_watching` /
// `cmd_fs_stop_watching` in `fs_watcher`. Frontend callsites must
// invoke the new commands.

pub use crate::commands::fs_watcher::mark_self_write;
