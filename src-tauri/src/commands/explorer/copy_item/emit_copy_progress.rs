use std::time::{Duration, Instant};

use tauri::Emitter;

use super::copy_accumulator::CopyAccumulator;
use super::copy_progress::CopyProgressPayload;

/// Emit a throttled `explorer-copy-progress` event from the current
/// accumulator state.
///
/// Only emits when `force` is set or when at least 50ms have elapsed since the
/// last emit. Always sends `done: false` — the command emits the final
/// `done: true` payload itself. No-ops when no `operation_id` is set so that
/// id-less copies stay silent.
pub fn emit_copy_progress(
    window: &tauri::Window,
    acc: &mut CopyAccumulator,
    current_file: &str,
    force: bool,
) {
    if acc.operation_id.is_empty() {
        return;
    }

    if !force && acc.last_emit.elapsed() < Duration::from_millis(50) {
        return;
    }

    let payload = CopyProgressPayload {
        operation_id: acc.operation_id.clone(),
        total_bytes: acc.total_bytes,
        copied_bytes: acc.copied_bytes,
        total_files: acc.total_files,
        files_done: acc.files_done,
        current_file: current_file.to_string(),
        done: false,
    };

    let _ = window.emit("explorer-copy-progress", &payload);
    acc.last_emit = Instant::now();
}
