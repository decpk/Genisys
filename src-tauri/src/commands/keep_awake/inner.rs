use std::sync::Arc;
use std::sync::atomic::AtomicBool;
use std::thread::JoinHandle;

/// Runtime-only state backing the "Stay Awake" feature.
///
/// Holds the active `keepawake` guard (display + system sleep inhibitor), a
/// shared stop flag used to gracefully tear down the periodic nudge loop, and
/// the join handle of that loop's worker thread. All fields are `None` while
/// the feature is inactive.
#[derive(Default)]
pub struct KeepAwakeInner {
    /// Sleep inhibitor guard. Dropping it restores normal display/system sleep.
    pub guard: Option<keepawake::KeepAwake>,
    /// Cooperative stop flag observed by the nudge loop each second.
    pub stop_flag: Option<Arc<AtomicBool>>,
    /// Worker thread that performs the periodic no-op input nudge.
    pub nudge_thread: Option<JoinHandle<()>>,
    /// Whether lid-close (clamshell) sleep prevention is currently applied.
    pub lid_active: bool,
    /// (Windows) saved prior lid-close action indices `(ac, dc)`, restored on
    /// revert so the user's power plan is left exactly as it was.
    #[cfg(target_os = "windows")]
    pub saved_lid_action: Option<(String, String)>,
    /// (Linux) held `systemd-inhibit` child; killing it releases the lid lock.
    #[cfg(target_os = "linux")]
    pub lid_inhibitor: Option<std::process::Child>,
}
