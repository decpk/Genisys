use crate::commands::AppState;
use crate::database::mock_load_variants_db;
use serde_json::{json, Value};
use tauri::State;

/// Load all variants for an endpoint, ordered by `order_index`.
#[tauri::command]
pub fn cmd_mock_load_variants(state: State<'_, AppState>, endpoint_id: String) -> Value {
    let variants = mock_load_variants_db(&state.db, &endpoint_id);
    json!({ "success": true, "data": variants })
}
