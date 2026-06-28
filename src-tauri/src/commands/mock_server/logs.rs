use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

/// Load persisted request logs for a mock server (newest first), with optional
/// filters. Thin command wrapper over [`crate::database::mock_load_request_logs_db`].
#[tauri::command]
pub fn cmd_mock_load_logs(
    state: State<'_, AppState>,
    server_id: String,
    method: Option<String>,
    status: Option<i64>,
    path_contains: Option<String>,
    limit: Option<i64>,
) -> Value {
    let logs = crate::database::mock_load_request_logs_db(
        &state.db,
        &server_id,
        method,
        status,
        path_contains,
        limit,
    );
    json!({ "success": true, "data": logs })
}

/// Delete all persisted request logs for a mock server.
#[tauri::command]
pub fn cmd_mock_clear_logs(state: State<'_, AppState>, server_id: String) -> Value {
    match crate::database::mock_clear_request_logs_db(&state.db, &server_id) {
        Ok(()) => json!({ "success": true }),
        Err(e) => json!({ "success": false, "error": e }),
    }
}

/// Export all persisted request logs for a mock server as a JSON array string.
#[tauri::command]
pub fn cmd_mock_export_logs(state: State<'_, AppState>, server_id: String) -> Value {
    let data = crate::database::mock_export_request_logs_db(&state.db, &server_id);
    json!({ "success": true, "data": data })
}
