use crate::commands::AppState;
use crate::database::save_dp_review_db;
use crate::types::DPReview;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_save_review(state: State<'_, AppState>, review: DPReview) -> Value {
    save_dp_review_db(&state.db, &review);
    serde_json::json!({"success": true})
}
