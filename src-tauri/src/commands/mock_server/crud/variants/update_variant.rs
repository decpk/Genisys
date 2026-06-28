use crate::commands::AppState;
use crate::database::mock_update_variant_db;
use serde_json::{json, Value};
use tauri::State;

/// Update an existing variant's editable fields.
#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub fn cmd_mock_update_variant(
    state: State<'_, AppState>,
    id: String,
    name: Option<String>,
    status_code: Option<i64>,
    response_headers: Option<String>,
    response_body: Option<String>,
    match_rules: Option<String>,
    weight: Option<i64>,
    order_index: Option<i64>,
    is_active: Option<bool>,
) -> Value {
    match mock_update_variant_db(
        &state.db,
        &id,
        name,
        status_code,
        response_headers,
        response_body,
        match_rules,
        weight,
        order_index,
        is_active,
    ) {
        Ok(data) => json!({ "success": true, "data": data }),
        Err(e) => json!({ "success": false, "error": e }),
    }
}
