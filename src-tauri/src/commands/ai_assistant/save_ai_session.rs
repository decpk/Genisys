use crate::commands::AppState;
use crate::database::save_ai_session_db;
use crate::types::AIAssistantSessionMeta;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_save_ai_session(state: State<'_, AppState>, session: AIAssistantSessionMeta) -> Value {
    save_ai_session_db(&state.db, &session);
    serde_json::json!({"success": true})
}
