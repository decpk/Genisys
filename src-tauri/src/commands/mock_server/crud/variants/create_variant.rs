use crate::commands::AppState;
use crate::database::mock_create_variant_db;
use serde_json::{json, Value};
use tauri::State;

/// Create a new variant for an endpoint.
#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub fn cmd_mock_create_variant(
    state: State<'_, AppState>,
    endpoint_id: String,
    name: Option<String>,
    status_code: Option<i64>,
    response_headers: Option<String>,
    response_body: Option<String>,
    match_rules: Option<String>,
    weight: Option<i64>,
    order_index: Option<i64>,
    is_active: Option<bool>,
) -> Value {
    match mock_create_variant_db(
        &state.db,
        &endpoint_id,
        &name.unwrap_or_default(),
        status_code.unwrap_or(200),
        &response_headers.unwrap_or_else(|| "{}".to_string()),
        &response_body.unwrap_or_default(),
        &match_rules.unwrap_or_else(|| "[]".to_string()),
        weight.unwrap_or(1),
        order_index.unwrap_or(0),
        is_active.unwrap_or(true),
    ) {
        Ok(data) => json!({ "success": true, "data": data }),
        Err(e) => json!({ "success": false, "error": e }),
    }
}
