use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

use enigo::{Direction, Enigo, Key, Keyboard, Settings};

use super::{KeepAwakeState, NUDGE_INTERVAL_SECS};

/// Error surfaced when the presence nudge cannot run because the OS has not
/// granted Genisys Accessibility / input-simulation trust. The frontend
/// pre-checks `cmd_accessibility_status` and drives the grant flow, so this is
/// primarily a defensive backstop against a status→start race.
pub const ACCESSIBILITY_REQUIRED_MSG: &str =
    "Accessibility permission is required so Genisys can keep presence-aware apps \
     (e.g. Slack) marked Available. Grant Genisys under System Settings → \
     Privacy & Security → Accessibility, then try again.";

/// Starts the "Stay Awake" feature: inhibits display + system sleep and spawns
/// a worker thread that periodically simulates a harmless no-op key tap so
/// presence-aware apps keep the user marked "Available". Idempotent — calling
/// it while already active is a no-op.
#[tauri::command]
pub fn cmd_keep_awake_start(state: tauri::State<'_, KeepAwakeState>) -> Result<(), String> {
    let mut inner = state.inner.lock().map_err(|e| e.to_string())?;

    // Already active — nothing to do.
    if inner.guard.is_some() {
        return Ok(());
    }

    // Gate on Accessibility trust BEFORE creating any sleep inhibitor so we
    // never create-then-drop an IOKit assertion. The check is live/uncached, so
    // a grant made after an earlier failure is picked up on the next call
    // without an app restart.
    if !crate::commands::cmd_accessibility_status() {
        return Err(ACCESSIBILITY_REQUIRED_MSG.to_string());
    }

    // Inhibit display + system idle sleep.
    let guard = keepawake::Builder::default()
        .display(true)
        .idle(true)
        .reason("Genisys Stay Awake")
        .app_name("Genisys")
        .create()
        .map_err(|e| format!("Failed to start keep-awake: {e}"))?;

    // Defensive: confirm input simulation really initialises now that we are
    // trusted. If it unexpectedly fails, undo the sleep inhibitor before
    // surfacing a guiding error to the user.
    if let Err(e) = Enigo::new(&Settings::default()) {
        drop(guard);
        return Err(format!(
            "Input simulation unavailable: {e}. On macOS, grant Accessibility \
             permission in System Settings → Privacy & Security → Accessibility \
             for Genisys, then try again."
        ));
    }

    // Spawn the periodic nudge loop.
    let stop_flag = Arc::new(AtomicBool::new(false));
    let thread_flag = stop_flag.clone();
    let handle = thread::spawn(move || run_nudge_loop(thread_flag));

    inner.guard = Some(guard);
    inner.stop_flag = Some(stop_flag);
    inner.nudge_thread = Some(handle);

    Ok(())
}

/// Worker loop: sleeps in 1-second slices (so stop requests are honoured
/// promptly) and performs a no-op input nudge every `NUDGE_INTERVAL_SECS`.
/// A fresh `Enigo` is constructed inside the thread because it is not safe to
/// hold across the managed-state struct.
fn run_nudge_loop(stop_flag: Arc<AtomicBool>) {
    let mut enigo = match Enigo::new(&Settings::default()) {
        Ok(enigo) => enigo,
        Err(e) => {
            log::warn!("Stay Awake: could not initialise input simulation: {e}");
            return;
        }
    };

    let mut elapsed_secs: u64 = 0;
    while !stop_flag.load(Ordering::Relaxed) {
        thread::sleep(Duration::from_secs(1));
        elapsed_secs += 1;

        if elapsed_secs >= NUDGE_INTERVAL_SECS {
            elapsed_secs = 0;
            // F15 is a near-universally unused key: tapping it registers user
            // activity without disturbing the foreground app. Individual
            // failures are logged but never crash the loop.
            if let Err(e) = enigo.key(Key::F15, Direction::Click) {
                log::warn!("Stay Awake: nudge keystroke failed: {e}");
            }
        }
    }
}
