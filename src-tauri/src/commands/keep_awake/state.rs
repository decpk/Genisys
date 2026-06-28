use std::sync::Mutex;

use super::KeepAwakeInner;

/// Seconds between successive no-op input nudges that keep presence-aware
/// apps (e.g. Slack) reporting the user as "Available".
pub const NUDGE_INTERVAL_SECS: u64 = 60;

/// Tauri-managed state wrapper for the "Stay Awake" feature.
pub struct KeepAwakeState {
    pub inner: Mutex<KeepAwakeInner>,
}

impl KeepAwakeState {
    pub fn new() -> Self {
        Self { inner: Mutex::new(KeepAwakeInner::default()) }
    }
}

impl Default for KeepAwakeState {
    fn default() -> Self {
        Self::new()
    }
}
