use crate::commands::AppState;
use crate::database::{load_webpage_url_db, update_webpage_file_db};
use serde_json::Value;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub async fn cmd_update_webpage_content(
    app: AppHandle,
    state: State<'_, AppState>,
    id: String,
    html: String,
    updated_at: String,
) -> Result<Value, String> {
    // Get file_path from DB (url is unused for HTML edits)
    let (_url, file_name) = load_webpage_url_db(&state.db, &id)
        .ok_or_else(|| "Webpage not found".to_string())?;

    let webpages_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data dir: {e}"))?
        .join("saved-webpages");

    let full_path = webpages_dir.join(&file_name);

    // Overwrite file on disk with edited HTML
    std::fs::write(&full_path, html.as_bytes())
        .map_err(|e| format!("Failed to write HTML file: {e}"))?;

    let file_size = html.as_bytes().len() as i64;

    // Update DB timestamp and file size
    update_webpage_file_db(&state.db, &id, file_size, &updated_at);

    Ok(serde_json::json!({
        "success": true,
        "fileSize": file_size,
        "updatedAt": updated_at
    }))
}
