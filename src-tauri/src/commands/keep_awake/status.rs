use super::KeepAwakeState;

/// Returns `true` when the "Stay Awake" feature is currently active.
#[tauri::command]
pub fn cmd_keep_awake_status(state: tauri::State<'_, KeepAwakeState>) -> Result<bool, String> {
    let inner = state.inner.lock().map_err(|e| e.to_string())?;
    Ok(inner.guard.is_some())
}
