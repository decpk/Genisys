use crate::commands::AppState;
use crate::database::remove_webpage_db;
use serde_json::Value;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn cmd_remove_webpage(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
) -> Value {
    // Get file path from DB before deleting record
    let file_path = {
        let conn = state.db.reader();
        conn.query_row(
            "SELECT file_path FROM saved_webpages WHERE id = ?1",
            rusqlite::params![&id],
            |row| row.get::<_, String>(0),
        )
        .ok()
    };

    // Delete file from disk
    if let Some(ref fp) = file_path {
        if let Ok(webpages_dir) = app.path().app_data_dir() {
            let full_path = webpages_dir.join("saved-webpages").join(fp);
            let _ = std::fs::remove_file(full_path);
        }
    }

    // Delete DB record
    remove_webpage_db(&state.db, &id);

    serde_json::json!({"success": true})
}
