use crate::commands::AppState;
use crate::database::load_ai_sessions_db;
use crate::types::AIAssistantSessionMeta;
use tauri::State;

#[tauri::command]
pub fn cmd_load_ai_sessions(
    state: State<'_, AppState>,
    app_id: String,
    scope_key: Option<String>,
) -> Vec<AIAssistantSessionMeta> {
    let result = load_ai_sessions_db(&state.db, &app_id, scope_key.as_deref());
    println!("[db-debug] cmd_load_ai_sessions({app_id}) => {} sessions", result.len());
    result
}
