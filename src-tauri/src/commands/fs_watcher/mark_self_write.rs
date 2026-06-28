use std::time::Instant;

use super::state::registry;

/// Mark the most recent self-initiated write so debounced events fired
/// shortly afterward can be suppressed. Called by every write command
/// keyed by the watched root path string.
pub fn mark_self_write(root_path: &str) {
    if let Ok(mut reg) = registry().lock() {
        if let Some(state) = reg.get_mut(root_path) {
            state.last_self_write = Instant::now();
        }
    }
}
