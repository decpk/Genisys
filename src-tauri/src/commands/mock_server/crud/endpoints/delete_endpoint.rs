use crate::commands::AppState;
use serde_json::{json, Value};
use tauri::State;

#[tauri::command]
pub fn cmd_mock_delete_endpoint(state: State<'_, AppState>, id: String) -> Value {
    let conn = state.db.conn();

    // Delete variants first so the foreign-key constraint on
    // mock_endpoint_variants.endpoint_id doesn't block the endpoint delete.
    let _ = conn.execute(
        "DELETE FROM mock_endpoint_variants WHERE endpoint_id = ?1",
        rusqlite::params![id],
    );

    match conn.execute(
        "DELETE FROM mock_endpoints WHERE id = ?1",
        rusqlite::params![id],
    ) {
        Ok(changed) if changed > 0 => json!({"success": true}),
        Ok(_) => json!({"success": false, "error": "Endpoint not found"}),
        Err(e) => json!({"success": false, "error": e.to_string()}),
    }
}
