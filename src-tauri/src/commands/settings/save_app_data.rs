use crate::commands::AppState;
use crate::database::save_app_data_db;
use serde_json::Value;
use std::sync::atomic::Ordering;
use tauri::State;

#[tauri::command]
pub async fn cmd_save_app_data(state: State<'_, AppState>, data: Value) -> Result<Value, ()> {
    // Store the latest value and bump version
    {
        let mut pending = state.pending_app_data.lock().unwrap();
        *pending = Some(data);
    }
    let version = state.app_data_version.fetch_add(1, Ordering::SeqCst) + 1;

    // Wait a short period to coalesce rapid calls
    tokio::time::sleep(std::time::Duration::from_millis(500)).await;

    // Only write if no newer call has arrived
    if state.app_data_version.load(Ordering::SeqCst) == version {
        let value = {
            let mut pending = state.pending_app_data.lock().unwrap();
            pending.take()
        };
        if let Some(v) = value {
            println!("[db-debug] cmd_save_app_data => writing (version {version})");
            save_app_data_db(&state.db, &v);
        }
    } else {
        println!("[db-debug] cmd_save_app_data => skipped (version {version}, newer exists)");
    }

    Ok(serde_json::json!({"success": true}))
}
