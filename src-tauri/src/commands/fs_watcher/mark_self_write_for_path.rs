use std::path::Path;
use std::time::Instant;

use super::state::registry;

/// Mark a self-initiated write at an absolute filesystem path. Resolves
/// the watched root by longest-prefix match and updates that root's
/// `last_self_write` timestamp so the watcher's debounced callback can
/// suppress the resulting echo events for the suppression window.
pub fn mark_self_write_for_path(abs_path: &Path) {
    let abs_str = abs_path.to_string_lossy();
    let Ok(mut reg) = registry().lock() else {
        return;
    };
    let mut best_key: Option<String> = None;
    let mut best_len: usize = 0;
    for key in reg.keys() {
        if abs_str == key.as_str() || abs_str.starts_with(&format!("{key}/")) {
            if key.len() > best_len {
                best_len = key.len();
                best_key = Some(key.clone());
            }
        }
    }
    if let Some(key) = best_key {
        if let Some(state) = reg.get_mut(&key) {
            state.last_self_write = Instant::now();
        }
    }
}
