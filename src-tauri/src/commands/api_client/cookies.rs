use crate::commands::AppState;
use crate::database::{load_api_cookie_jars_db, load_api_cookies_db, save_api_cookie_jar_db, save_api_cookie_db, remove_api_cookie_db, clear_api_cookie_jar_db};
use crate::types::{ApiCookieJar, ApiCookie};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn cmd_api_load_cookie_jars(state: State<'_, AppState>, workspace_id: String) -> Vec<ApiCookieJar> {
    load_api_cookie_jars_db(&state.db, &workspace_id)
}

#[tauri::command]
pub fn cmd_api_load_cookies(state: State<'_, AppState>, jar_id: String) -> Vec<ApiCookie> {
    load_api_cookies_db(&state.db, &jar_id)
}

#[tauri::command]
pub fn cmd_api_save_cookie_jar(state: State<'_, AppState>, jar: ApiCookieJar) -> Value {
    save_api_cookie_jar_db(&state.db, &jar);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_save_cookie(state: State<'_, AppState>, cookie: ApiCookie) -> Value {
    save_api_cookie_db(&state.db, &cookie);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_remove_cookie(state: State<'_, AppState>, cookie_id: String) -> Value {
    remove_api_cookie_db(&state.db, &cookie_id);
    serde_json::json!({"success": true})
}

#[tauri::command]
pub fn cmd_api_clear_cookie_jar(state: State<'_, AppState>, jar_id: String) -> Value {
    clear_api_cookie_jar_db(&state.db, &jar_id);
    serde_json::json!({"success": true})
}
