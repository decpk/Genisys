use crate::commands::AppState;
use crate::database::mock_delete_variant_db;
use serde_json::{json, Value};
use tauri::State;

/// Delete a variant by id.
#[tauri::command]
pub fn cmd_mock_delete_variant(state: State<'_, AppState>, id: String) -> Value {
    match mock_delete_variant_db(&state.db, &id) {
        Ok(_) => json!({ "success": true }),
        Err(e) => json!({ "success": false, "error": e }),
    }
}
