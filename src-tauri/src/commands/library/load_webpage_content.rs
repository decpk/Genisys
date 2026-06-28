use crate::commands::AppState;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn cmd_load_webpage_content(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
) -> Result<String, String> {
    // Get file path from DB
    let file_name: String = {
        let conn = state.db.reader();
        conn.query_row(
            "SELECT file_path FROM saved_webpages WHERE id = ?1",
            rusqlite::params![&id],
            |row| row.get::<_, String>(0),
        )
        .map_err(|e| format!("Webpage not found: {e}"))?
    };

    let webpages_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data dir: {e}"))?
        .join("saved-webpages");

    let full_path = webpages_dir.join(&file_name);

    std::fs::read_to_string(&full_path)
        .map_err(|e| format!("Failed to read MHTML file: {e}"))
}
