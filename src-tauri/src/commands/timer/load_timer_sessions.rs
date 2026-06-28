use crate::commands::AppState;
use crate::database::load_timer_sessions_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_load_timer_sessions(
    state: State<'_, AppState>,
    filter: Option<Value>,
    pagination: Option<Value>,
) -> Value {
    let f = filter.unwrap_or(Value::Null);
    let p = pagination.unwrap_or(Value::Null);

    let task_id = f.get("taskId").and_then(|v| v.as_str()).map(|s| s.to_string());
    let dp_task_id = f.get("dailyPlanTaskId").and_then(|v| v.as_str()).map(|s| s.to_string());
    let tag_id = f.get("tagId").and_then(|v| v.as_str()).map(|s| s.to_string());
    let from_date = f.get("fromDate").and_then(|v| v.as_str()).map(|s| s.to_string());
    let to_date = f.get("toDate").and_then(|v| v.as_str()).map(|s| s.to_string());

    let limit = p.get("limit").and_then(|v| v.as_i64()).unwrap_or(50);
    let offset = p.get("offset").and_then(|v| v.as_i64()).unwrap_or(0);

    let (items, has_more) = load_timer_sessions_db(
        &state.db,
        task_id.as_deref(),
        dp_task_id.as_deref(),
        tag_id.as_deref(),
        from_date.as_deref(),
        to_date.as_deref(),
        limit,
        offset,
    );
    serde_json::json!({ "items": items, "hasMore": has_more })
}
