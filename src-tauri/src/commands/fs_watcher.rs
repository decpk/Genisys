// Generic filesystem watcher feature.
//
// Singleton registry keyed by `root_path`. Each registered root has a
// debouncer (300 ms) on top of `notify`'s recommended watcher. Events
// are classified into a `kind` (head / index / refs / merge / workdir)
// and emitted to the frontend as `fs-change`. Self-emitted events are
// suppressed within 500 ms of any registered write op.

mod cmd_fs_start_watching;
mod cmd_fs_stop_watching;
mod mark_self_write;
mod mark_self_write_for_path;
mod state;

pub use cmd_fs_start_watching::cmd_fs_start_watching;
pub use cmd_fs_stop_watching::cmd_fs_stop_watching;
pub use mark_self_write::mark_self_write;
pub use mark_self_write_for_path::mark_self_write_for_path;
