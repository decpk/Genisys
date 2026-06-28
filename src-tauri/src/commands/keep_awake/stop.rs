use std::sync::atomic::Ordering;

use super::KeepAwakeState;

/// Stops the "Stay Awake" feature: signals the nudge loop to exit, joins its
/// worker thread, and drops the sleep inhibitor to restore normal display/
/// system sleep behaviour. Idempotent — safe to call when already inactive.
#[tauri::command]
pub fn cmd_keep_awake_stop(state: tauri::State<'_, KeepAwakeState>) -> Result<(), String> {
    // Extract the stop flag + thread handle and drop the guard while holding
    // the lock, but join the thread only after releasing it so we never block
    // other commands on a thread that may take up to a second to wake.
    let (stop_flag, thread_handle) = {
        let mut inner = state.inner.lock().map_err(|e| e.to_string())?;
        let stop_flag = inner.stop_flag.take();
        let thread_handle = inner.nudge_thread.take();
        // Dropping the guard here restores normal sleep behaviour.
        inner.guard = None;
        (stop_flag, thread_handle)
    };

    if let Some(flag) = stop_flag {
        flag.store(true, Ordering::Relaxed);
    }

    if let Some(handle) = thread_handle {
        let _ = handle.join();
    }

    Ok(())
}
