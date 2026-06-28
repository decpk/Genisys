use crate::commands::AppState;
use crate::database::get_usage_stats_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_get_usage_stats(state: State<'_, AppState>, range: Option<Value>) -> Value {
    let r = range.unwrap_or(Value::Null);
    let from = r.get("fromDate").and_then(|v| v.as_str()).map(|s| s.to_string());
    let to = r.get("toDate").and_then(|v| v.as_str()).map(|s| s.to_string());
    get_usage_stats_db(&state.db, from.as_deref(), to.as_deref())
}
