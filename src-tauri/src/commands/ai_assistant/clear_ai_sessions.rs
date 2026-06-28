use crate::commands::AppState;
use crate::database::clear_ai_sessions_db;
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_clear_ai_sessions(
    state: State<'_, AppState>,
    app_id: String,
    scope_key: Option<String>,
    except_session_id: Option<String>,
) -> Value {
    clear_ai_sessions_db(
        &state.db,
        &app_id,
        scope_key.as_deref(),
        except_session_id.as_deref(),
    );
    serde_json::json!({"success": true})
}
